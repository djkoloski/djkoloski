import re
import os
from PIL import Image

'''
Turns a path into a unique variable name
'''
def PathToVar(path):
	return '_'.join('_'.join('_'.join(path.split('/')).split('\\')).split('.'))

'''
Normalizes a path to UNIX-style paths
'''
def NormalizePath(path):
	if os.name == 'nt':
		return path.replace('\\', '/')
	else:
		return path

'''
Determines if a path is a file that needs preprocessing
'''
def IsPreprocessingRequired(path):
	return re.match(r'.*\.template\..*', path) != None

'''
Determines if a path is a file that needs tile set expansion
'''
def IsTileSetExpansionRequired(path):
	return re.match(r'.*\.tileset\..*', path) != None

'''
Determines if a path is an ignored file and should be excluded from resource loading
'''
def IsIgnoredFile(path):
	ignoredFiles = [
		r'.*loading\.js'
	]
	
	if IsPreprocessingRequired(path) or IsTileSetExpansionRequired(path):
		return True
	
	for pattern in ignoredFiles:
		if re.match(pattern, path):
			return True
	return False

'''
Makes the environment variables for the preprocessor
'''
def GetEnvironmentVariables():
	env = {}
	env['preprocess'] = []
	env['tilesetexpansion'] = []
	env['resources'] = {}
	env['sources'] = []
	
	root = os.path.abspath('.')
	res = os.path.abspath('res')
	src = os.path.abspath('src')
	
	for subdir, dirs, files in os.walk(res):
		for fileName in files:
			abspath = os.path.join(os.path.relpath(subdir, root), fileName)
			if subdir == res:
				respath = fileName
			else:
				respath = os.path.join(os.path.relpath(subdir, res), fileName)
			
			if IsPreprocessingRequired(abspath):
				env['preprocess'].append(abspath)
			if IsTileSetExpansionRequired(abspath):
				env['tilesetexpansion'].append(abspath)
			if not IsIgnoredFile(abspath):
				env['resources'][PathToVar(respath)] = NormalizePath(abspath)
	
	for subdir, dirs, files in os.walk(src):
		for fileName in files:
			abspath = os.path.join(os.path.relpath(subdir, root), fileName)
			if IsPreprocessingRequired(abspath):
				env['preprocess'].append(abspath)
			if IsTileSetExpansionRequired(abspath):
				env['tilesetexpansion'].append(abspath)
			if not IsIgnoredFile(fileName):
				env['sources'].append(NormalizePath(abspath))
	
	return env

'''
Processes a .template.* file into a .* file
	/*# dict var indent */
		Paste the key/value pairs of the variable with the given name at the given indent
	/*# list var indent */
		Paste the entries of the variable with the given name at the given indent
'''
def Preprocess(path, env):
	with open(path, 'r') as content_file:
		content = content_file.read()
	
	while True:
		match = re.search(r'/\*#(.*)\*/', content)
		if match == None:
			break
		
		replace = ''
		
		pieces = match.group(1).strip().split(' ')
		if pieces[0] == 'dict':
			indent = int(pieces[2])
			lines = []
			for key, value in env[pieces[1]].iteritems():
				lines.append('\t' * indent + key + ': "' + value + '"')
			replace = ',\n'.join(lines)
		elif pieces[0] == 'list':
			indent = int(pieces[2])
			lines = []
			for value in env[pieces[1]]:
				lines.append('\t' * indent + '"' + value + '"')
			replace = ',\n'.join(lines)
		else:
			print('Unrecognized preprocessor command \'%s\'' % ' '.join(pieces))
		
		content = content[:match.start()] + replace + content[match.end():]
	
	with open(path.replace('.template', ''), 'w') as output_file:
		output_file.write(content)

'''
Expands the tiles in a tile set by 1 pixel on each edge
'''
def ExpandTileSet(path):
	img = Image.open(path)
	width, height = img.size
	newWidth, newHeight = (width / 32 * 34, height / 32 * 34)
	
	outimg = Image.new('RGBA', (width / 32 * 34, height / 32 * 34))
	
	for y in xrange(newHeight):
		yindex = y % 34
		if yindex > 0:
			yindex -= 1
		if yindex > 31:
			yindex -= 1
		for x in xrange(newWidth):
			xindex = x % 34
			if xindex > 0:
				xindex -= 1
			if xindex > 31:
				xindex -= 1
			outimg.putpixel((x, y), img.getpixel((xindex + x // 34 * 32, yindex + y // 34 * 32)))
	
	outPath = path.replace('.tileset', '')
	outimg.save(outPath)

if __name__ == '__main__':
	env = GetEnvironmentVariables()
	Preprocess('project.template.json', env)
	
	for template in env['preprocess']:
		Preprocess(template, env)
	
	for tileset in env['tilesetexpansion']:
		ExpandTileSet(tileset)
