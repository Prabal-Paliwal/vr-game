// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Device orientation controls
let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
let initialOrientation = null;

function handleOrientation(event) {
    if (!initialOrientation) {
        initialOrientation = {
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0
        };
    }

    let alpha = (event.alpha || 0) - initialOrientation.alpha;
    let beta = (event.beta || 0) - initialOrientation.beta;
    let gamma = (event.gamma || 0) - initialOrientation.gamma;

    // Convert to radians
    alpha = alpha * Math.PI / 180;
    beta = beta * Math.PI / 180;
    gamma = gamma * Math.PI / 180;

    // Create quaternion from Euler angles
    let euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
    camera.quaternion.setFromEuler(euler);
}

if (window.DeviceOrientationEvent) {
    if (isIOS) {
        // iOS requires user interaction to enable device orientation
        window.addEventListener('deviceorientation', handleOrientation, false);
    } else {
        window.addEventListener('deviceorientation', handleOrientation, false);
    }
} else {
    console.log('Device orientation not supported');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});