export default class Engine {

    constructor(canvas, ui){

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.ui = ui;

        this.nodes = [];
        this.edges = [];

        this.dragNode = null;
		
		this.hasMoved = false;

        this.crossings = 0;
		
		this.crossedEdges = new Set();
		
		this.badNodes = new Set();
		
		this.levelCompleted = false;

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        this.bindInput();
    }


    /* ---------- SETUP ---------- */

    loadLevel(level){

        this.nodes = structuredClone(level.nodes);
        this.edges = structuredClone(level.edges);

        this.checkCrossings();
		this.hasMoved = false;
    }

    resize(){

        this.canvas.width =
            this.canvas.clientWidth;

        this.canvas.height =
            this.canvas.clientHeight;
    }


    /* ---------- INPUT ---------- */

    bindInput(){

        this.canvas.addEventListener(
            "pointerdown",
            (e)=>this.pointerDown(e)
        );

        window.addEventListener(
            "pointermove",
            (e)=>this.pointerMove(e)
        );

        window.addEventListener(
            "pointerup",
            ()=>this.pointerUp()
        );
    }

    pointerDown(e){

        const pos = this.getPointer(e);

        for(const node of this.nodes){

            const dx = pos.x - node.x;
            const dy = pos.y - node.y;

            const dist =
                Math.hypot(dx,dy);

            if(dist <= node.radius){

                this.dragNode = node;
                break;
            }
        }
    }

    pointerMove(e){

        if(!this.dragNode) return;

        const pos = this.getPointer(e);

        this.dragNode.x = pos.x;
        this.dragNode.y = pos.y;
		
		if(
			!this.hasMoved
		){

			this.hasMoved = true;
		}

        this.checkCrossings();
    }

    pointerUp(){

		if(!this.dragNode) return;

		this.dragNode = null;

		this.checkCrossings();

		if(
			this.crossings === 0
			&&
			!this.levelCompleted
		){

			this.levelCompleted = true;

			this.ui.winOverlay
				.classList.remove("hidden");
		}
	}

    getPointer(e){

        const rect =
            this.canvas.getBoundingClientRect();

        return{

            x:e.clientX - rect.left,
            y:e.clientY - rect.top
        };
    }


    /* ---------- COLLISION ---------- */

    checkCrossings(){

		let total = 0;

		this.crossedEdges.clear();
		this.badNodes.clear();

		for(let i=0;i<this.edges.length;i++){

			for(let j=i+1;j<this.edges.length;j++){

				const a = this.edges[i];
				const b = this.edges[j];

				if(
					this.shareNode(a,b)
				){
					continue;
				}

				if(

					this.linesIntersect(

						this.nodes[a.a],
						this.nodes[a.b],

						this.nodes[b.a],
						this.nodes[b.b]
					)

				){

					total++;

					this.crossedEdges.add(i);
					this.crossedEdges.add(j);

					this.badNodes.add(a.a);
					this.badNodes.add(a.b);

					this.badNodes.add(b.a);
					this.badNodes.add(b.b);
				}
			}
		}

		this.crossings = total;

		if(total > 0){

			this.levelCompleted = false;

			this.ui.winOverlay
				.classList.add("hidden");
		}
	}

    shareNode(e1,e2){

        return(

            e1.a===e2.a ||
            e1.a===e2.b ||
            e1.b===e2.a ||
            e1.b===e2.b
        );
    }

    linesIntersect(p1,p2,p3,p4){

        function ccw(a,b,c){

            return(
                (c.y-a.y)*(b.x-a.x)
                >
                (b.y-a.y)*(c.x-a.x)
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


    /* ---------- DRAW ---------- */

    draw(){

        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.drawEdges();
        this.drawNodes();
    }

    drawEdges(){

		const ctx = this.ctx;

		for(let i=0;i<this.edges.length;i++){

			const edge =
				this.edges[i];

			const n1 =
				this.nodes[edge.a];

			const n2 =
				this.nodes[edge.b];

			const crossed =
				this.crossedEdges.has(i);

            ctx.shadowColor = "rgba(0,0,0,.35)";
            
            ctx.shadowBlur = 6;
            
            ctx.shadowOffsetX = 3;
            
            ctx.shadowOffsetY = 3;

			ctx.beginPath();

			ctx.moveTo(
				n1.x,
				n1.y
			);

			ctx.lineTo(
				n2.x,
				n2.y
			);

			ctx.lineWidth = 3;

			if(crossed){

				ctx.strokeStyle =
					"#c22934";

			}
			else{

				ctx.strokeStyle =
					"#3A9C35";

			}



			ctx.stroke();

            ctx.shadowColor =
                "transparent";

            ctx.shadowBlur = 0;

            ctx.shadowOffsetX = 0;

            ctx.shadowOffsetY = 0;
		}


	}

    drawNodes(){

		const ctx = this.ctx;

		for(let i=0;i<this.nodes.length;i++){

			const node =
				this.nodes[i];

			const bad =
				this.badNodes.has(i);

                ctx.beginPath();

ctx.arc(
    node.x,
    node.y,
    node.radius,
    0,
    Math.PI * 2
);

const gradient =

    ctx.createRadialGradient(

        node.x - node.radius * 0.4,
        node.y - node.radius * 0.4,
        node.radius * 0.1,

        node.x,
        node.y,
        node.radius
    );


if(bad){

    gradient.addColorStop(
        0,
        "#f87171"
    );

    gradient.addColorStop(
        0.7,
        "#ef4444"
    );

    gradient.addColorStop(
        1,
        "#b91c1c"
    );
}
else{

    gradient.addColorStop(
        0,
        "#4ade80"
    );

    gradient.addColorStop(
        0.7,
        "#22c55e"
    );

    gradient.addColorStop(
        1,
        "#15803d"
    );
}

    ctx.fillStyle =
        gradient;
        
        ctx.shadowColor =
        "rgba(0,0,0,.4)";

    ctx.shadowBlur = 8;

    ctx.shadowOffsetX = 3;

    ctx.shadowOffsetY = 3;
    
    ctx.fill();

    ctx.shadowColor =
    "transparent";

    ctx.shadowBlur = 0;

    ctx.shadowOffsetX = 0;

    ctx.shadowOffsetY = 0;


		}

		ctx.shadowBlur = 0;
	}


    /* ---------- LOOP ---------- */

    start(){

        const loop = ()=>{

            this.draw();

            requestAnimationFrame(loop);
        };

        loop();
    }

}