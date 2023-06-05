// helpers

function unScale(value, scale) {
    return value / scale;
}

function getStageRect(stage) {
    return {
        x1: 0,
        y1: 0,
        x2: stage.width(),
        y2: stage.height(),
        offset: {
          x: unScale(stage.position().x, stage.scaleX()),
          y: unScale(stage.position().y, stage.scaleY()),
        }
    };
}

function getViewRect(stage, width, height) {
    let stageRect = getStageRect(stage);

    return {
        x1: -stageRect.offset.x,
        y1: -stageRect.offset.y,
        x2: unScale(width, stage.scaleX()) - stageRect.offset.x,
        y2: unScale(height, stage.scaleY()) - stageRect.offset.y
    };
}

function getGridOffset(stage, stepSize) {
    return {
        x: Math.ceil(unScale(stage.position().x, stage.scaleX()) / stepSize) * stepSize,
        y: Math.ceil(unScale(stage.position().y, stage.scaleY()) / stepSize) * stepSize,
      };
}

function getGridRect(stage, stepSize, width, height) {
    let gridOffset = getGridOffset(stage, stepSize);

    return {
        x1: -gridOffset.x,
        y1: -gridOffset.y,
        x2: unScale(width, stage.scaleX()) - gridOffset.x + stepSize,
        y2: unScale(height, stage.scaleY()) - gridOffset.y + stepSize
    };
}

function getGridFullRect(stage, stepSize, width, height) {
    let stageRect = getStageRect(stage);
    let gridRect = getGridRect(stage, stepSize, width, height);

    return {
        x1: Math.min(stageRect.x1, gridRect.x1),
        y1: Math.min(stageRect.y1, gridRect.y1),
        x2: Math.max(stageRect.x2, gridRect.x2),
        y2: Math.max(stageRect.y2, gridRect.y2)
    };
}


// classes

class FieldObject {
    constructor(stage, layer) {
        this.stage = stage;
        this.layer = layer;
    }

    onWheel(event) {}
    onDragmove(event) {}
    onMousemove(event) {}
    onPointerdown(event) {}
}


class GridObject extends FieldObject {
    constructor(stage, layer, grid_top_layer) {
        super(stage, layer);

        this.grid_top_layer = grid_top_layer;
    }

    init() {
        this.draw();
    }

    onWheel(event) {
        super.onWheel(event);

        this.draw();
    }

    onDragmove(event) {
        super.onDragmove(event);

        this.draw();
    }

    draw() {
        this.layer.destroyChildren();
        this.grid_top_layer.destroyChildren();

        let stepSize = 100;
        let scale = this.stage.scaleX();

        let base = 1;
        if (scale > 1) {
            scale /= 2;
            while (scale > 1) {
                base /= 2;
                scale /= 2;
            }
        }
        else {
            scale *= 2;
            while (scale < 1) {
                base *= 2;
                scale *= 2;
            }
        }

        stepSize *= base;

        let width = this.stage.width();
        let height = this.stage.height();

        let viewRect = getViewRect(this.stage, width, height); // ??

        this.layer.clip({
            x: viewRect.x1,
            y: viewRect.y1,
            width: viewRect.x2 - viewRect.x1,
            height: viewRect.y2 - viewRect.y1
        });

        this.grid_top_layer.clip({
            x: viewRect.x1,
            y: viewRect.y1,
            width: viewRect.x2 - viewRect.x1,
            height: viewRect.y2 - viewRect.y1
        });

        let fullRect = getGridFullRect(this.stage, stepSize, width, height); // ??

        const
        // find the x & y size of the grid
        xSize = (fullRect.x2 - fullRect.x1),
        ySize = (fullRect.y2 - fullRect.y1),

        // compute the number of steps required on each axis.
        xSteps = Math.round(xSize / stepSize),
        ySteps = Math.round(ySize / stepSize);


        scale = this.stage.scaleX();
        // draw vertical lines
        for (let i = 0; i <= xSteps; i++) {
            this.layer.add(
                new Konva.Line({
                    x: fullRect.x1 + i * stepSize,
                    y: fullRect.y1,
                    points: [0, 0, 0, ySize],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1 / scale,
                })
            );
        }

        //draw Horizontal lines
        for (let i = 0; i <= ySteps; i++) {
            this.layer.add(
                new Konva.Line({
                    x: fullRect.x1,
                    y: fullRect.y1 + i * stepSize,
                    points: [0, 0, xSize, 0],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1 / scale,
                })
            );
        }

        this.grid_top_layer.add(
            new Konva.Rect({
                x: viewRect.x1,
                y: viewRect.y1,
                width: xSize,
                height: 24 / scale,
                fill: '#fff'
            })
        );

        for (let i = 0; i <= xSteps; i++) {
            let tickText = new Konva.Text({
                x: fullRect.x1 + i * stepSize,
                y: viewRect.y1,
                text: fullRect.x1 + i * stepSize,
                fontSize: 24 / scale,
                fontFamily: 'Calibri',
                fill: 'green',
            });

            tickText.offsetX(tickText.width() / 2);

            this.grid_top_layer.add(tickText);
        }

        this.grid_top_layer.add(
            new Konva.Rect({
                x: viewRect.x1,
                y: viewRect.y1,
                width: 70 / scale,
                height: ySize,
                fill: '#fff'
            })
        );

        for (let i = 0; i <= ySteps; i++) {
            let tickText = new Konva.Text({
                x: viewRect.x1,
                y: fullRect.y1 + i * stepSize,
                text: fullRect.y1 + i * stepSize,
                fontSize: 24 / scale,
                fontFamily: 'Calibri',
                fill: 'green',
            });

            tickText.offsetY(tickText.height() / 2);

            this.grid_top_layer.add(tickText);
        }

        this.grid_top_layer.add(
            new Konva.Rect({
                x: viewRect.x1,
                y: viewRect.y1,
                width: 70 / scale,
                height: 24 / scale,
                fill: '#eee'
            })
        );

        this.layer.batchDraw();
        this.grid_top_layer.batchDraw();
    }
}


// class FieldEditMode {
//     constructor(field_controller, stage, layer) {
//         this.field_controller = field_controller;
//         this.stage = stage;
//         this.layer = layer;
//         this.info_block = document.getElementById('editModeInfo');
//     }

//     getAttachKey() { return ''; }

//     attach() {
//         this.info_block.innerHTML = `Edit mode: <b>${this.getEditModeName()}</b>`;
//     }
//     detach() {}

//     onWheel(event) {}
//     onDragmove(event) {}
//     onMousemove(event) {}
//     onPointerdown(event) {}
// }

// class ArrowEditMode extends FieldEditMode {
//     constructor(field_controller, stage, layer) {
//         super(field_controller, stage, layer);
//     }

//     getEditModeName() { return 'Arrow mode'; }

//     getAttachKey() { return 'Shift + A or Esc'; }

//     attach() {
//         super.attach();
//     }

//     detach() {
//         super.detach();
//     }
// }

// class CoordEditMode extends FieldEditMode {
//     constructor(field_controller, stage, layer) {
//         super(field_controller, stage, layer);

//         this.vert_line = new Konva.Line({
//             x: 0,
//             y: -15,
//             points: [0, 0, 0, 30],
//             stroke: 'red',
//             strokeWidth: 1,
//         });

//         this.hor_line = new Konva.Line({
//             x: -15,
//             y: 0,
//             points: [0, 0, 30, 0],
//             stroke: 'red',
//             strokeWidth: 1,
//         });

//         this.coord_text = new Konva.Text({
//             x: 4,
//             y: -24,
//             text: '',
//             fontSize: 20,
//             fontFamily: 'Calibri',
//             fill: 'red',
//         });

//         this.onWheel(null);
//     }

//     getEditModeName() { return 'Coordinate mode'; }

//     getAttachKey() { return 'Shift + C'; }

//     attach() {
//         super.attach();

//         this.layer.add(this.vert_line);
//         this.layer.add(this.hor_line);
//         this.layer.add(this.coord_text);
//     }

//     detach() {
//         super.detach();

//         this.layer.destroyChildren();
//     }

//     onMousemove(event) {
//         super.onMousemove(event);

//         let mousePos = this.stage.getRelativePointerPosition();
//         let scale = this.stage.scaleX();

//         this.vert_line.position({
//             x: mousePos.x,
//             y: mousePos.y - 15 / scale
//         });

//         this.hor_line.position({
//             x: mousePos.x - 15 / scale,
//             y: mousePos.y
//         });

//         this.coord_text.position({
//             x: mousePos.x + 4 / scale,
//             y: mousePos.y - 24 / scale
//         });

//         this.coord_text.text(`(${mousePos.x};${mousePos.y})`);
//     }

//     onPointerdown(event) {
//         super.onPointerdown(event);

//         //this.field_controller.addPoint(this.point_object);
//     }

//     onWheel(event) {
//         super.onWheel(event);

//         if (! this.stage) return;

//         let mousePos = this.stage.getRelativePointerPosition();
//         let scale = this.stage.scaleX();

//         this.vert_line.position({
//             x: mousePos.x,
//             y: mousePos.y - 15 / scale
//         });

//         this.hor_line.position({
//             x: mousePos.x - 15 / scale,
//             y: mousePos.y
//         });

//         this.coord_text.position({
//             x: mousePos.x + 4 / scale,
//             y: mousePos.y - 24 / scale
//         });

//         this.vert_line.points([0, 0, 0, 30 / scale]);

//         this.hor_line.points([0, 0, 30 / scale, 0]);

//         this.coord_text.fontSize(20 / scale);

//         this.vert_line.strokeWidth(2 / scale);

//         this.hor_line.strokeWidth(2 / scale);
//     }
// }

// class PointEditMode extends FieldEditMode {
//     constructor(field_controller, stage, layer) {
//         super(field_controller, stage, layer);

//         this.point_object = new Konva.Circle({
//             x: 0,
//             y: 0,
//             radius: 10,
//             fill: 'red',
//         });
//     }

//     getEditModeName() { return 'Point mode'; }

//     getAttachKey() { return 'Shift + P'; }

//     attach() {
//         super.attach();

//         this.layer.add(this.point_object);
//     }

//     detach() {
//         super.detach();

//         this.layer.destroyChildren();
//     }

//     onMousemove(event) {
//         super.onMousemove(event);

//         let mousePos = this.stage.getRelativePointerPosition();

//         this.point_object.position({
//             x: mousePos.x,
//             y: mousePos.y
//         });
//     }

//     onPointerdown(event) {
//         super.onPointerdown(event);

//         this.field_controller.addPoint(this.point_object);
//     }
// }

// class LineEditMode extends FieldEditMode {
//     constructor(field_controller, stage, layer) {
//         super(field_controller, stage, layer);

//         this.line_object = new Konva.Line({
//             stroke: 'red',
//             strokeWidth: 10,
//             lineJoin: 'round',
//             dash: [33, 10],
//         });

//         this.mode = 0;
//         this.p1 = [0, 0];
//         this.p2 = [0, 0];
//     }

//     getEditModeName() { return 'Line mode'; }

//     getAttachKey() { return 'Shift + L'; }

//     attach() {
//         super.attach();
//     }

//     detach() {
//         super.detach();

//         this.layer.destroyChildren();
//     }

//     onMousemove(event) {
//         super.onMousemove(event);

//         let mousePos = this.stage.getRelativePointerPosition();

//         if (this.mode == 1) {
//             this.p2 = [mousePos.x, mousePos.y];
//             this.updateLine();
//         }
//     }

//     onPointerdown(event) {
//         super.onPointerdown(event);

//         let mousePos = this.stage.getRelativePointerPosition();

//         if (this.mode == 0) {
//             this.p1 = [mousePos.x, mousePos.y];
//             this.p2 = [mousePos.x, mousePos.y];
//             this.updateLine();
//             this.layer.add(this.line_object);
//             this.mode = 1;
//         }
//         else if (this.mode == 1) {
//             this.p2 = [mousePos.x, mousePos.y];
//             this.updateLine();
//             this.field_controller.addLine(this.line_object);
//             this.layer.removeChildren();
//             this.mode = 0;
//         }
//     }

//     updateLine() {
//         this.line_object.points([...this.p1, ...this.p2]);
//     }
// }


class FieldController {
    constructor(canva_id, width, height) {
        this.stage = new Konva.Stage({
            container: canva_id,
            width: width,
            height: height,
            draggable: true,
        });

        this.stage.position({x: width / 2, y: height / 2});

        this.main_layer = null;

        this.debug = false;

        // field objects
        this.grid_object = null;
        this.field_objects = [];

        // edit mode
        // this.edit_mode_layer = null;
    }

    setDebug(debug) { this.debug = debug; }

     init() {
         this.setupActions();

         // init grid
         let grid_layer = new Konva.Layer();
         let grid_top_layer = new Konva.Layer();
         this.stage.add(grid_layer);

        this.grid_object = new GridObject(this.stage, grid_layer, grid_top_layer);
        this.grid_object.init();
        this.field_objects.push(this.grid_object);

         // init main layer
         this.main_layer = new Konva.Layer();
         this.stage.add(this.main_layer);

    //     // init edit mode
    //     this.edit_mode_layer = new Konva.Layer();
    //     this.stage.add(this.edit_mode_layer);

    //     this.curr_edit_mode = new ArrowEditMode(this, this.stage, this.edit_mode_layer);
    //     this.curr_edit_mode.attach();

        // add grid top layer
         this.stage.add(grid_top_layer);

        // debug
    //     if (this.debug) {
    //         console.log('hello');
    //         this.main_layer.add(
    //             new Konva.Circle({
    //                 x: 0,
    //                 y: 0,
    //                 radius: 50,
    //                 fill: 'red',
    //                 stroke: 'black',
    //             })
    //         );
    //     }
     }

    setupActions() {
        this.stage.on('wheel', event => {
            this.wheelAction(event);

            this.field_objects.forEach(item => {
                item.onWheel(event);
            });

            this.curr_edit_mode.onWheel(event);
        });

        this.stage.on('dragmove', event => {
            this.field_objects.forEach(item => {
                item.onDragmove(event);
            });

            this.curr_edit_mode.onDragmove(event);
        });

        this.stage.on('mousemove', event => {
            this.field_objects.forEach(item => {
                item.onMousemove(event);
            });

            this.curr_edit_mode.onMousemove(event);
        });

        // this.stage.on('pointerdown', event => {
        //     this.field_objects.forEach(item => {
        //         item.onPointerdown(event);
        //     });

        //     this.curr_edit_mode.onPointerdown(event);
        // });

        // document.addEventListener('keydown', event => {
        //     if (event.shiftKey) {
        //         switch (event.code) {
        //             case 'KeyA':
        //                 this.curr_edit_mode.detach();
        //                 this.curr_edit_mode = new ArrowEditMode(this, this.stage, this.edit_mode_layer);
        //                 this.curr_edit_mode.attach();
        //                 break;

        //             case 'KeyC':
        //                 this.curr_edit_mode.detach();
        //                 this.curr_edit_mode = new CoordEditMode(this, this.stage, this.edit_mode_layer);
        //                 this.curr_edit_mode.attach();
        //                 break;

        //             case 'KeyP':
        //                 this.curr_edit_mode.detach();
        //                 this.curr_edit_mode = new PointEditMode(this, this.stage, this.edit_mode_layer);
        //                 this.curr_edit_mode.attach();
        //                 break;

        //             case 'KeyL':
        //                 this.curr_edit_mode.detach();
        //                 this.curr_edit_mode = new LineEditMode(this, this.stage, this.edit_mode_layer);
        //                 this.curr_edit_mode.attach();
        //                 break;
        //         }
        //     }
        //     else {
        //         switch (event.code) {
        //             case 'Escape':
        //                 this.curr_edit_mode.detach();
        //                 this.curr_edit_mode = new ArrowEditMode(this.stage, this.edit_mode_layer);
        //                 this.curr_edit_mode.attach();
        //                 break;
        //         }
        //     }

        // });
    }

    wheelAction(event) {
        // stop default scrolling
        event.evt.preventDefault();

        var scaleBy = 1.10;

        let oldScale = this.stage.scaleX();
        let pointer = this.stage.getPointerPosition();

        let mousePointTo = {
          x: (pointer.x - this.stage.x()) / oldScale,
          y: (pointer.y - this.stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = event.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (event.evt.ctrlKey) {
          direction = -direction;
        }

        let newScale = direction > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        if (newScale > 0.1 && newScale < 30) {
            this.stage.scale({ x: newScale, y: newScale });

            let newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            this.stage.position(newPos);
        }

        if (this.debug) {
            console.log(newScale);
        }
    }

    // functions
//     addPoint(point) {
//         this.main_layer.add(point.clone({
//             fill: 'green'
//         }));
//     }

//     addLine(line) {
//         this.main_layer.add(line.clone({
//             stroke: 'green',
//             dash: undefined
//         }));
//     }
}

// let field_controller = null;

// main function
// document.addEventListener('DOMContentLoaded', () => {
//     field_controller = new FieldController('container', window.innerWidth, window.innerHeight);
//     field_controller.setDebug(false);
//     field_controller.init();

//     let edit_modes = [
//         new ArrowEditMode(),
//         new CoordEditMode(),
//         new PointEditMode(),
//         new LineEditMode()
//     ];

//     let controls_info_text = '<i>Switch to mode:</i><br>';
//     edit_modes.forEach(item => {
//         controls_info_text += `${item.getEditModeName()}: ${item.getAttachKey()}<br>`;
//     });
//     document.getElementById('controlsInfo').innerHTML = controls_info_text;
// });


export default GridObject;
