import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js'; 
import { OrbitControls } from 'three/examples/jsm/Addons.js';


export default function App() {
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  
  // State to manage the background class for the main container
  const [backgroundClass, setBackgroundClass] = useState('bg-pink-200');
  
  // *** REMOVED: canvasDimensions state is no longer needed ***

  // Function to change HTML and Three.js canvas background colors
  const changeBackgrounds = useCallback((htmlColor, threeColor) => {
    setBackgroundClass(htmlColor);
    if (rendererRef.current) {
      rendererRef.current.setClearColor(threeColor);
    }
  }, []);

  // *** REMOVED: changeCanvasSize function is no longer needed ***

  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (!canvas) {
      console.error("Canvas element not found!");
      return;
    }

    // --- Scene Setup ---
    // Reads the initial size from the DOM (which is set by Tailwind CSS)
    const sizes = {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(0, 1.5, 4); 
    scene.add(camera);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));
    renderer.setClearColor(0xf5e6e8);
    rendererRef.current = renderer; 

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(2, 5, 5);
    scene.add(directionalLight);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(1, 1 ,1); 

    // --- GLTF Model Loader ---
    const loader = new GLTFLoader();
    
    loader.load(
      '/free_porsche_911_carrera_4s.glb',
      (gltf) => {
        modelRef.current = gltf.scene;
        scene.add(modelRef.current);
        
        // Fixed scale
        modelRef.current.scale.set(1, 1, 1);
        modelRef.current.position.set(0, 0, 0); 
        
        console.log("3D model loaded successfully!");
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100).toFixed(2) + '% loaded');
      },
      (error) => {
        console.error('An error occurred loading the model:', error);
      }
    );

    // --- Animation Loop ---
    const animate = () => {
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005; 
      }
      
      controls.update(); 
      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    };
    
    // --- Responsive Design (Only for window resizing) ---
    const handleResize = () => {
      sizes.width = canvas.clientWidth;
      sizes.height = canvas.clientHeight;
      
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);
    // Initial size check
    handleResize(); 
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      controls.dispose();
    };
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <div className={`main-container w-screen h-screen ${backgroundClass} text-white flex flex-col justify-center items-center`}>
      <div className="text-2xl font-bold mb-4 text-gray-800">My Bakery 3D Viewer</div>
      
      {/* SECTION 1: CANVAS CONTAINER 
          - Now uses fixed Tailwind classes w-[800px] h-[600px] 
          - No inline 'style' attribute used for dimensions
      */}
      <div 
        className="w-[1600px] h-[600px] shadow-2xl border-4 border-gray-700 bg-white/10"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      
      <div className="mt-4 p-4 rounded-lg bg-white/90 text-gray-800 flex flex-col items-center space-y-4">
        
        {/* Background Color Controls */}
        <div className="flex space-x-4">
          <p className="text-sm font-semibold">Change Background:</p>
          <button 
            className="px-3 py-1 bg-pink-500 rounded-md text-white hover:bg-pink-600 transition-colors"
            onClick={() => changeBackgrounds('bg-pink-100', 0xf5e6e8)}
          >
            Pink
          </button>
          <button 
            className="px-3 py-1 bg-gray-900 rounded-md text-white hover:bg-gray-700 transition-colors"
            onClick={() => changeBackgrounds('bg-gray-900', 0x222222)}
          >
            Dark
          </button>
          <button 
            className="px-3 py-1 bg-green-500 rounded-md text-white hover:bg-green-600 transition-colors"
            onClick={() => changeBackgrounds('bg-green-100', 0xe0ffea)}
          >
            Green
          </button>
        </div>

        <hr className="w-full border-t border-gray-300" />

        {/* SECTION 2: CANVAS SIZE MANIPULATION CONTROLS 
            - Buttons are removed as they are no longer functional.
        */}
        <div className="text-sm text-gray-600 italic">
          Canvas size is fixed at 800px x 600px.
        </div>
        
      </div>
    </div>
  );
}