precision mediump float;

uniform vec4 lightPosition;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUV;
varying vec4 vColor;

void main(void)
{
	vec3 toLight = normalize(lightPosition.xyz - vPosition);
	float diffuse = clamp(dot(vNormal, toLight), 0.0, 1.0);
	gl_FragColor = vec4(vColor.xyz * diffuse, 1.0);
}
