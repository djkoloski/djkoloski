HOW TO USE:
	Because the GLSL shaders are loaded from external files with AJAX, a simple server will need to be run from the root directory.
		A good option for this is simply "python -m SimpleHTTPServer"
	
	Choose a mesh type (sphere, torus, cone, cylinder, hexagonal prism)
	Choose whether to quantize (force into 1/0 format instead of preserving floating point values)
	Choose whether to blur (perform a 3D blur on the data)
	Choose a thresholding value (kind of like blur+contrast in photoshop but in 3D on meshes)
	Choose whether to render as voxels (ugly) or marching cubes (very pretty)
	Hit Rerender to render the object

FEATURES:
	I put together a simple component-based engine in javascript that's based off of unity called Iron (Fe)
	To do some simple voxel data remeshing, quantize, blur, and render with marching cubes with a threshold of about 0.5
