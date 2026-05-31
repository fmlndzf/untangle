import Engine from "./engine/engine.js";
import LEVELS from "./engine/levels.js";

const canvas =
    document.getElementById("gameCanvas");

const winOverlay =
    document.getElementById("winOverlay");

const restartBtn =
    document.getElementById("restartBtn");

const newBtn =
    document.getElementById("newBtn");
	
const resetBtn =
    document.getElementById("resetBtn");

const newGameBtn =
    document.getElementById("newGameBtn");
	
const levelBtn =
    document.getElementById("levelBtn");

const randomBtn =
    document.getElementById("randomBtn");

const levelOverlay =
    document.getElementById("levelOverlay");

const levelGrid =
    document.getElementById("levelGrid");


const ui = {

    winOverlay,
    resetBtn
};


const game =
    new Engine(canvas,ui);


let currentLevel = null;
let originalLevel = null;

let currentNodeCount = 6;


/* ---------- RANDOM LEVEL ---------- */

function createRandomLevel(){

    const w =
        canvas.clientWidth;

    const h =
        canvas.clientHeight;

    while(true){

        const catalog =

            LEVELS[
                currentNodeCount
            ];


        const template =

            structuredClone(

                catalog[

                    Math.floor(

                        Math.random()
                        *
                        catalog.length
                    )
                ]
            );


        const nodes = [];

        for(
            let i=0;
            i<currentNodeCount;
            i++
        ){

            nodes.push({

                x:
                    60 +
                    Math.random()
                    *
                    (w-120),

                y:
                    80 +
                    Math.random()
                    *
                    (h-160),

                radius:22
            });
        }


        const edges =

            template.map(

                ([a,b])=>({

                    a,
                    b
                })
            );


        const level = {

            nodes,
            edges
        };


        if(
            countCrossings(level)
            > 0
        ){

            return level;
        }

    }

}

/* ---------- COUNT CROOSSINGS ---------- */

function countCrossings(level){

    let total = 0;

    for(let i=0;i<level.edges.length;i++){

        for(let j=i+1;j<level.edges.length;j++){

            const e1 =
                level.edges[i];

            const e2 =
                level.edges[j];

            if(

                e1.a===e2.a ||
                e1.a===e2.b ||
                e1.b===e2.a ||
                e1.b===e2.b

            ){
                continue;
            }

            if(

                linesIntersect(

                    level.nodes[e1.a],
                    level.nodes[e1.b],

                    level.nodes[e2.a],
                    level.nodes[e2.b]
                )

            ){

                total++;
            }
        }
    }

    return total;
}

/* ---------- LINES INTERSECT---------- */

function linesIntersect(
			p1,p2,p3,p4
		){

			function ccw(a,b,c){

				return(

					(c.y-a.y)
					*
					(b.x-a.x)

					>

					(b.y-a.y)
					*
					(c.x-a.x)
				);
			}

			return(

				ccw(p1,p3,p4)
				!==
				ccw(p2,p3,p4)

				&&

				ccw(p1,p2,p3)
				!==
				ccw(p1,p2,p4)
			);
}


/* ---------- LOAD ---------- */

function loadNewGame(){

    currentLevel =
        createRandomLevel();

    originalLevel =
        structuredClone(
            currentLevel
        );

    game.loadLevel(
        currentLevel
    );
	

}

/* ---------- LEVEL GRID ---------- */

function buildLevelGrid(){

    levelGrid.innerHTML = "";

    for(
        let n=6;
        n<=14;
        n++
    ){

        const btn =
            document.createElement(
                "button"
            );

        btn.className =
            "levelItem";

        btn.textContent = n;

        btn.addEventListener(

            "click",

            ()=>{

                currentNodeCount = n;

                levelOverlay
                    .classList
                    .add("hidden");

                loadNewGame();
            }
        );

        levelGrid.appendChild(
            btn
        );
    }
}

/* ---------- NEW ---------- */

newBtn.addEventListener(
    "click",
    ()=>{

        winOverlay
            .classList
            .add("hidden");

        loadNewGame();
    }
);

/* ---------- RANDOM ---------- */

randomBtn.addEventListener(

    "click",

    ()=>{

        winOverlay
            .classList
            .add("hidden");


        currentNodeCount =

            6 +

            Math.floor(

                Math.random()
                * 9
            );


        loadNewGame();
    }
);

/* ---------- RESET ---------- */

resetBtn.addEventListener(

    "click",

    ()=>{

        winOverlay
            .classList
            .add("hidden");

        game.loadLevel(

            structuredClone(
                originalLevel
            )
        );
		
				
			}
);

/* ---------- PLAY AGAIN ---------- */

restartBtn.addEventListener(
    "click",
    ()=>{

        winOverlay
            .classList
            .add("hidden");

        game.loadLevel(

            structuredClone(
                originalLevel
            )
        );
		
		
    }
);


/* ---------- NEW GAME ---------- */

newGameBtn.addEventListener(
    "click",
    ()=>{

        winOverlay
            .classList
            .add("hidden");

        loadNewGame();
    }
);

/* ---------- LEVEL ---------- */
levelBtn.addEventListener(

    "click",

    ()=>{

        levelOverlay
            .classList
            .remove("hidden");
		
    }
);

levelOverlay.addEventListener(

    "click",

    (e)=>{

        if(
            e.target === levelOverlay
        ){

            levelOverlay
                .classList
                .add("hidden");
        }
    }
);

/* ---------- START ---------- */

buildLevelGrid();

loadNewGame();

game.start();