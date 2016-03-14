uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec4 color;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec4 vColor;

void main(void)
{
	vec4 p = modelViewMatrix * vec4(position, 1.0);
	vec3 n = normalize(normalMatrix * normal);
	
	vPosition = p.xyz;
	vNormal = n;
	vUV = uv;
	vColor = color;
	gl_Position = projectionMatrix * p;
}
