var main = {

    scene: null, camera: null, renderer: null, controls: null, mesh: null, selectedExpression: null,
    tweenMouth: new TWEEN.Tween(), tweenAnnoyed: new TWEEN.Tween(), tweenConcerned: new TWEEN.Tween(),
    tweenSmile: new TWEEN.Tween(), tweenBlink: new TWEEN.Tween(), tweenBlink2: new TWEEN.Tween(),
    clock: new THREE.Clock(),

    gui: new dat.GUI({ height: 5 * 32 - 1 }),
    morphFolder: null, morphMeshes: [],

    loadingManager: new THREE.LoadingManager( function() {
	
        var loadingScreen = document.getElementById( 'loading-screen' );
        loadingScreen.classList.add('fade-out');

        //Remove loader from DOM
        loadingScreen.addEventListener( 'transitionend', onTransitionEnd );

    }),

    init: function () {
        
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.5, -6.7);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.gammaOutput = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.maxPolarAngle = Math.PI / 2 - 0.00001;
        this.controls.enablePan = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 25;

        var dir_light3 = new THREE.DirectionalLight(0xffffff, 0.8);
        dir_light3.position.set(0, 10, 0);
        this.scene.add(dir_light3);

        var pointLight = new THREE.PointLight(0xcccccc, 2.5);
        this.camera.add(pointLight);

        this.scene.add(this.camera);

        this.gui.domElement.id = 'gui';
        this.morphFolder = this.gui.addFolder('Combine Expressions');

        //Load cat head
        this.loadCat();
        this.clickFunctions();
    },

    loadCat: function () {

        var loader = new THREE.GLTFLoader(main.loadingManager);
        loader.load('cat/cat-head.gltf', function (gltf) {

            var cat = gltf.scene;

            cat.traverse(function (node) {

                if (node.isMesh && node.morphTargetInfluences) {
                    main.mesh = node;
                    main.morphMeshes.push(node);
                }

                if (node.material) {

                    for (var i = 0; i < node.material.length; i++) {

                        node.material[i].precision = 'mediump';
                    }

                    node.material.precision = 'mediump';
                }

            });

            var morphAttributes = main.mesh.geometry.morphAttributes;
            morphAttributes.position[0].name = 'Surprised';
            morphAttributes.position[1].name = 'Blink';
            morphAttributes.position[2].name = 'Annoyed';
            morphAttributes.position[3].name = 'Concerned';
            morphAttributes.position[4].name = 'Smile';

            if (main.morphMeshes.length) {

                main.morphMeshes.forEach(function (mesh) {

                    for (let i = 0; i < main.mesh.morphTargetInfluences.length && i < morphAttributes.position.length ; i++) {

                        var targets = main.morphFolder.add(mesh.morphTargetInfluences, i, 0, 1, 0.01).name(morphAttributes.position[i].name).listen();

                    }

                });

            }

            //Mouth open and close
            main.tweenMouth.onUpdate(function () {
                if (main.mesh.morphTargetInfluences[0] <= 1) {
                    main.mesh.morphTargetInfluences[0] += 0.05;
                }
                //Run morph target for mouth opening and close any other currently run expressions, so that only this one is displayed
                //(Switching expressions)
                for (let i = 0; i < main.mesh.morphTargetInfluences.length; i++) {

                    if (main.mesh.morphTargetInfluences[i] > 0 && main.mesh.morphTargetInfluences[i] !== main.mesh.morphTargetInfluences[0]) {
                        main.mesh.morphTargetInfluences[i] -= 0.05;
                    }
                }
            });
            main.tweenMouth.easing(TWEEN.Easing.Exponential.InOut);

            //Annoyed expression
            main.tweenAnnoyed.onUpdate(function () {
                if (main.mesh.morphTargetInfluences[2] <= 1) {
                    main.mesh.morphTargetInfluences[2] += 0.05;
                }

                for (let i = 0; i < main.mesh.morphTargetInfluences.length; i++) {

                    if (main.mesh.morphTargetInfluences[i] > 0 && main.mesh.morphTargetInfluences[i] !== main.mesh.morphTargetInfluences[2]) {
                        main.mesh.morphTargetInfluences[i] -= 0.05;
                    }
                }
            });
            main.tweenAnnoyed.easing(TWEEN.Easing.Exponential.InOut);

            //Concerned expression
            main.tweenConcerned.onUpdate(function () {
                if (main.mesh.morphTargetInfluences[3] <= 1) {
                    main.mesh.morphTargetInfluences[3] += 0.05;
                }

                for (let i = 0; i < main.mesh.morphTargetInfluences.length; i++) {

                    if (main.mesh.morphTargetInfluences[i] > 0 && main.mesh.morphTargetInfluences[i] !== main.mesh.morphTargetInfluences[3]) {
                        main.mesh.morphTargetInfluences[i] -= 0.05;
                    }
                }
            });
            main.tweenConcerned.easing(TWEEN.Easing.Exponential.InOut);

            //Smile expression
            main.tweenSmile.onUpdate(function () {
                if (main.mesh.morphTargetInfluences[4] <= 1) {
                    main.mesh.morphTargetInfluences[4] += 0.05;
                }

                for (let i = 0; i < main.mesh.morphTargetInfluences.length; i++) {

                    if (main.mesh.morphTargetInfluences[i] > 0 && main.mesh.morphTargetInfluences[i] !== main.mesh.morphTargetInfluences[4]) {
                        main.mesh.morphTargetInfluences[i] -= 0.05;
                    }
                }
            });
            main.tweenSmile.easing(TWEEN.Easing.Exponential.InOut);


            //Show cat blinking (morphTarget) automatically when loaded
            var blink = main.mesh.morphTargetInfluences[1];

            main.tweenBlink.to(blink, 100); //quick speed of blink
            main.tweenBlink.onUpdate(function () {
                main.mesh.morphTargetInfluences[1] = 1;
            });

            main.tweenBlink2.onUpdate(function () {
                main.mesh.morphTargetInfluences[1] = 0;
            });

            main.tweenBlink.easing(TWEEN.Easing.Bounce.InOut);
            main.tweenBlink2.easing(TWEEN.Easing.Bounce.InOut);

            main.tweenBlink.chain(main.tweenBlink2);
            main.tweenBlink2.chain(main.tweenBlink);

            main.tweenBlink.delay(5000); //blink once every 5 seconds
            main.tweenBlink.start();

            cat.translateY(1.5);
            main.scene.add(cat);

        });

    },

    clickFunctions: function () {

        document.getElementById('normal').addEventListener('click', function () {

            main.tweenMouth.stop();
            main.tweenAnnoyed.stop();

            var tweenReset = new TWEEN.Tween();

            if (main.mesh !== undefined) {

                tweenReset.onUpdate(function () {

                    for (let i = 0; i < main.mesh.morphTargetInfluences.length; i++) {

                        if (main.mesh.morphTargetInfluences[i] > 0) {
                            main.mesh.morphTargetInfluences[i] -= 0.05;
                        }
                    }
                });

                tweenReset.easing(TWEEN.Easing.Exponential.InOut);
                tweenReset.start();
            }
            main.selectExpression($(this));

        });

        document.getElementById('mouth').addEventListener('click', function () {

            main.tweenMouth.start();
            main.selectExpression($(this));
        });

        document.getElementById('annoyed').addEventListener('click', function () {

            main.tweenAnnoyed.start();
            main.selectExpression($(this));
        });

        document.getElementById('concerned').addEventListener('click', function () {

            main.tweenConcerned.start();
            main.selectExpression($(this));
        });

        document.getElementById('smile').addEventListener('click', function () {

            main.tweenSmile.start();
            main.selectExpression($(this));
        });

        document.getElementById('combine').addEventListener('click', function () {

            $('#gui').toggle('slow');
            main.selectExpression($(this));

        });

    },

    selectExpression: function (ex) {

        if (main.selectedExpression) {
            main.selectedExpression.removeClass('selected');
        }

        ex.addClass('selected');

        main.selectedExpression = ex;
    }

};

function onWindowResize() {

    main.camera.aspect = window.innerWidth / window.innerHeight;
    main.camera.updateProjectionMatrix();
    main.renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate); 
    main.controls.update();
    TWEEN.update();
    render();
}

function render() {

    main.renderer.render(main.scene, main.camera);

}

function onTransitionEnd(event) {

    event.target.remove();
}

function onLoad() {
    main.init();
    animate();
}


window.addEventListener("load", onLoad, false);
window.addEventListener('resize', onWindowResize, false);
