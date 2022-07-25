import React, { useRef, useEffect } from "react";
import "./styles.css";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
let scenes = [
  {
    id: 0,
    root: "/",
    file: "cornell.glb"
  }
];
const Scene3d = () => {
  const loadPromise = (root, file, scene) => {
    return new Promise((res, rej) => {
      BABYLON.SceneLoader.LoadAssetContainer(root, file, scene, function (
        container
      ) {
        let root = new BABYLON.TransformNode();

        container.meshes.map((m) => {
          // console.log(m);
          if (!m.parent) {
            m.parent = root;
          }
        });

        res(container);
      });
    });
  };

  var main = async (scene) => {
    var assetContainers = [];
    for (var i = 0; i < scenes.length; i++) {
      var assets = await loadPromise(scenes[i].root, scenes[i].file, scene);
      assetContainers.push(assets);
    }

    assetContainers[0].addAllToScene();
  };

  const createScene = (scene, renderCanvas) => {
    let camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      1.6,
      7.6,
      new BABYLON.Vector3(0, 1.5, 0),
      scene
    );
    camera.attachControl(renderCanvas, true);

    // camera.target = scene.meshes[2];

    var hdrTexture = new BABYLON.CubeTexture(
      "/textures/Softbox_specular.env",
      scene
    );
    hdrTexture.gammaSpace = false;
    scene.environmentTexture = hdrTexture;
    // dyn light to generate shadows
    var light = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(0, -1, 0),
      scene
    );
    light.position = new BABYLON.Vector3(0, 3, 0);
    // shadows handling
    // var shadowGenerator = new BABYLON.ShadowGenerator(128, light);
    // shadowGenerator.useBlurExponentialShadowMap = true;
    // meshes.forEach(function (mesh) {
    //   shadowGenerator.addShadowCaster(mesh);
    // });

    scene.materials.forEach(function (material) {
      material.environmentIntensity = 1.4;
    });

    // all new meshes now receive shadows (shadowGenerator created below)
    scene.meshes.forEach(function (mesh) {
      mesh.receiveShadows = true;
    });

    // why not using glow?
    // var glowLayer = new BABYLON.GlowLayer("glow", scene, {
    //   mainTextureFixedSize: 256,
    //   blurKernelSize: 32
    // });

    return scene;
  };

  const canvasRef = useRef(null);

  useEffect(() => {
    const renderCanvas = canvasRef.current;
    const engine = new BABYLON.Engine(renderCanvas);
    const scene = new BABYLON.Scene(engine);

    let sceneToRender = createScene(scene, renderCanvas);
    main(scene);

    engine.runRenderLoop(() => {
      sceneToRender.render();
    });

    window.addEventListener("resize", function () {
      engine.resize();
    });
  });

  return (
    <>
      <div className="scene" id="containerCanvas">
        <canvas className="scene" id="renderCanvas" ref={canvasRef} />
      </div>
    </>
  );
};

function assignLightmapOnMaterial(material, lightmap) {
  material.emissive = lightmap;
  material.lightmapTexture = lightmap;
  material.lightmapTexture.coordinatesIndex = 1;
  material.useLightmapAsShadowmap = true;
}

export default Scene3d;
