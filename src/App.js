import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";
import "./styles.css";
import {
  MainContainer,
  ContentContainer,
  ButtonsContainer,
  ButtonContainer,
  WPSizeButtonsContainer,
  CounterButton,
  WorkpointIcon,
  PolygonIcon,
  ConfirmIcon,
  CenterIcon,
  LineIcon,
  WallIcon,
  CopyIcon,
  PasteIcon,
  DeleteIcon
} from "./app.styles";

export default function App() {
  let clipboard = null;
  let line;
  let isDrawing;
  let is_creating;
  let shape;
  let mouseCoords;
  let shiftKeyDown = false;
  let mouseDownPoint = null;
  const { editor, onReady } = useFabricJSEditor();
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineMode, setLineMode] = useState();
  const [wpSize, setWpSize] = useState(10);

  const editorMemo = useMemo(() => editor?.canvas, [editor?.canvas]);

  const workpoint = new fabric.Circle({
    top: 50,
    left: 50,
    radius: wpSize,
    stroke: "black",
    fill: "transparent"
  });

  const referencePoint = new fabric.Circle({
    top: 50,
    left: 50,
    radius: 15,
    fill: "#934de8"
  });

  const CopySelection = () => {
    if (editor) {
      const activeObj = editorMemo.getActiveObject();
      if (activeObj) {
        activeObj.clone(function (cloned) {
          clipboard = cloned;
        });
      }
    }
  };

  const PasteSelection = () => {
    if (clipboard) {
      clipboard.clone(function (clonedObj) {
        editorMemo.discardActiveObject();
        clonedObj.set({
          left: clonedObj.left + 20,
          top: clonedObj.top,
          evented: true
        });
        if (clonedObj.type === "activeSelection") {
          clonedObj.canvas = editorMemo;
          clonedObj.forEachObject(function (obj) {
            editorMemo.add(obj);
          });
          clonedObj.setCoords();
        } else {
          editorMemo.add(clonedObj);
        }
        clipboard.top += 10;
        clipboard.left += 10;
        editorMemo.setActiveObject(clonedObj);
        editorMemo.requestRenderAll();
      });
    }
  };

  //move selected object with keys

  const Direction = {
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3
  };
  const STEP = 2;

  const moveSelected = (direction) => {
    if (editor) {
      const activeObject = editorMemo.getActiveObject();

      if (activeObject) {
        switch (direction) {
          case Direction.LEFT:
            activeObject.set({ left: activeObject.left - STEP });
            break;
          case Direction.UP:
            activeObject.set({ top: activeObject.top - STEP });
            break;
          case Direction.RIGHT:
            activeObject.set({ left: activeObject.left + STEP });
            break;
          case Direction.DOWN:
            activeObject.set({ top: activeObject.top + STEP });
            break;
          default:
        }
        activeObject.setCoords();
        editorMemo.renderAll();
      }
    }
  };

  fabric.util.addListener(document.body, "keydown", function (options) {
    if (options.repeat) {
      return;
    }
    var key = options.which || options.keyCode;
    if (key === 37) {
      moveSelected(Direction.LEFT);
    } else if (key === 38) {
      moveSelected(Direction.UP);
    } else if (key === 39) {
      moveSelected(Direction.RIGHT);
    } else if (key === 40) {
      moveSelected(Direction.DOWN);
    } else if (key === 16 && editor) {
      editorMemo.defaultCursor = "move";
      shiftKeyDown = true;
    }
  });

  const removeEvent = (eventName) => {
    let lisnr = editorMemo.__eventListeners[eventName];
    lisnr.forEach((event) => {
      editorMemo.off(eventName, event);
    });
  };

  useEffect(() => {
    if (editor) {
      console.log(editorMemo.__eventListeners);
    }
  }, [editor]);

  const keepPositionInBounds = () => {
    if (editor) {
      var zoom = editorMemo.getZoom();
      var xMin = ((2 - zoom) * editorMemo.getWidth()) / 2;
      var xMax = (zoom * editorMemo.getWidth()) / 2;
      var yMin = ((2 - zoom) * editorMemo.getHeight()) / 2;
      var yMax = (zoom * editorMemo.getHeight()) / 2;

      var point = new fabric.Point(
        editorMemo.getWidth() / 2,
        editorMemo.getHeight() / 2
      );
      var center = fabric.util.transformPoint(
        point,
        editorMemo.viewportTransform
      );

      var clampedCenterX = clamp(center.x, xMin, xMax);
      var clampedCenterY = clamp(center.y, yMin, yMax);

      var diffX = clampedCenterX - center.x;
      var diffY = clampedCenterY - center.y;

      if (diffX != 0 || diffY != 0) {
        editorMemo.relativePan(new fabric.Point(diffX, diffY));
      }
    }
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  const drawLineDown = useCallback(
    (o) => {
      console.log("anfijuewnve");
      if (isDrawingLine && editor) {
        isDrawing = true;
        var pointer = editorMemo.getPointer(o.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];

        if (isDrawingLine) {
          line = new fabric.Line(points, {
            strokeWidth: 5,
            stroke: lineMode === "scale" ? "red" : "#ca1ad6"
          });
        }
        editorMemo.add(line);
      }
    },
    [editor]
  );

  const drawLineMove = useCallback(
    (o) => {
      if (isDrawing && isDrawingLine) {
        var pointer = editorMemo.getPointer(o.e);
        if (isDrawingLine) {
          line.set({ x2: pointer.x, y2: pointer.y });
          editorMemo.renderAll();
        }
      }
    },
    [editor, isDrawing, isDrawingLine]
  );

  const drawLineUp = useCallback(
    (o) => {
      isDrawing = false;
      setIsDrawingLine(false);
      editorMemo.selection = true;
      removeEvent("mouse:down");
    },
    [editor]
  );

  const checkIntersections = useCallback(
    (options) => {
      if (options) {
        options.target.setCoords();
        editorMemo.forEachObject((obj) => {
          if (obj === options.target) return;
          //obj.set(
          //  "stroke",
          //  options?.target?.intersectsWithObject(obj) ? "red" : "black"
          // );
        });
      }
    },
    [editor]
  );

  const updateZoom = useCallback(
    (opt) => {
      var delta = opt.e.deltaY;
      var zoom = editorMemo.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 1) zoom = 1;
      editorMemo.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    },
    [editor]
  );

  const handleZoomMouseDown = useCallback(
    (options) => {
      var pointer = editorMemo.getPointer(options.e, true);
      mouseDownPoint = new fabric.Point(pointer.x, pointer.y);
    },
    [editor]
  );

  const handleZoomMouseUp = useCallback(() => {
    mouseDownPoint = null;
  }, [editor]);

  const handleZoomMouseMove = useCallback(
    (options) => {
      if (shiftKeyDown && mouseDownPoint) {
        var pointer = editorMemo.getPointer(options.e, true);
        var mouseMovePoint = new fabric.Point(pointer.x, pointer.y);
        editorMemo.relativePan(mouseMovePoint.subtract(mouseDownPoint));
        mouseDownPoint = mouseMovePoint;
        keepPositionInBounds(editorMemo);
      }
    },
    [editor]
  );

  useEffect(() => {
    if (editor) {
      editorMemo.backgroundColor = "white";
      fabric.Group.prototype.hasControls = false;
      fabric.Object.prototype.hasControls = false;
      const imageURL =
        "https://www.udr.com/globalassets/communities/island-square/floor-plans/plan-a1wd---islandsquare_a1wd_2d_web.gif";
      new fabric.Image.fromURL(imageURL, function (img) {
        img.set({
          left: 0,
          top: 0,
          scaleX: editorMemo.width / img.width,
          scaleY: editorMemo.height / img.height
        });
        editorMemo.setBackgroundImage(img);
        editorMemo.renderAll();
      });

      //zoom

      editorMemo.on("mouse:wheel", updateZoom);

      editorMemo.on("mouse:down", handleZoomMouseDown);
      editorMemo.on("mouse:up", handleZoomMouseUp);
      editorMemo.on("mouse:move", handleZoomMouseMove);

      //lines
      editorMemo.on("mouse:down", drawLineDown);

      editorMemo.on("mouse:move", drawLineMove);

      editorMemo.on("mouse:up", drawLineUp);

      // Intersection

      editorMemo.on("object:moving", checkIntersections);
    }
  }, [editor]);

  const onAddCircle = () => {
    editorMemo.add(workpoint);
  };

  const onDeleteSelection = () => {
    const activeSelection = editorMemo.getActiveObject();
    if (activeSelection && activeSelection._objects) {
      activeSelection._objects.map((object) => editorMemo.remove(object));
    } else {
      editorMemo.remove(activeSelection);
    }
  };

  const onAddScale = () => {
    editorMemo.selection = false;
    setLineMode("scale");
    setIsDrawingLine(true);
  };

  const onAddWall = () => {
    editorMemo.selection = false;
    setLineMode("wall");
    setIsDrawingLine(true);
  };

  const onAddReferencePoint = () => {
    editorMemo.add(referencePoint);
  };

  const handleToSVG = () => {
    const svg = editorMemo.toSVG();
    console.log("svg", svg);
  };

  const handleToJSON = () => {
    const jsonObj = editorMemo.toDatalessJSON();
    const output = JSON.stringify(jsonObj, null, "\t");
    console.log("output", output);
  };

  // polygon tool
  const createPolygon = () => {
    console.log("polygon point");
    editorMemo.on("mouse:down", function (evt) {});
    editorMemo.on("mouse:up", function (evt) {
      mouseCoords = {
        x: editorMemo.getPointer(evt.e, true).x,
        y: editorMemo.getPointer(evt.e, true).y
      };

      if (!is_creating) {
        is_creating = true;
        shape = new fabric.Polygon(
          [
            {
              x: mouseCoords.x,
              y: mouseCoords.y
            },
            {
              x: mouseCoords.x + 1,
              y: mouseCoords.y + 1
            }
          ],
          {
            fill: "#59d9a4bf",
            perPixelTargetFind: true,
            top: mouseCoords.y,
            left: mouseCoords.x,
            strokeWidth: 2
          }
        );
        editorMemo.add(shape);
      } else {
        shape.points.push({
          x: mouseCoords.x,
          y: mouseCoords.y
        });
        editorMemo.remove(shape);
        var obj = shape.toObject();
        delete obj.top;
        delete obj.left;
        shape = new fabric.Polygon(shape.points, obj);
        editorMemo.add(shape);
      }
      editorMemo.setActiveObject(shape);
    });
  };

  const confirmPolygon = () => {
    removeEvent("mouse:down");
    removeEvent("mouse:up");
  };

  const onIncreaseWpSize = () => {
    if (wpSize < 15) {
      setWpSize((prev) => prev + 1);
    }
  };

  const onDecreaseWpSize = () => {
    if (wpSize > 5) {
      setWpSize((prev) => prev - 1);
    }
  };

  const GroupSelection = () => {
    const activeGroup = editorMemo.getActiveObject();
    if (activeGroup._objects) {
      const objectsInGroup = activeGroup.getObjects();

      const newObject = new fabric.Group(objectsInGroup, {
        top: 50,
        left: 50
      });

      objectsInGroup.forEach(function (object) {
        editorMemo.remove(object);
      });

      editorMemo.add(newObject);
      newObject.setCoords();
      editorMemo.renderAll();
    }
  };

  return (
    <MainContainer>
      <ContentContainer>
        <ButtonsContainer>
          <ButtonContainer onClick={onAddCircle}>
            <WorkpointIcon />
          </ButtonContainer>
          <WPSizeButtonsContainer>
            <CounterButton onClick={onDecreaseWpSize}>-</CounterButton>
            {wpSize}
            <CounterButton onClick={onIncreaseWpSize}>+</CounterButton>
          </WPSizeButtonsContainer>
          <ButtonContainer onClick={createPolygon}>
            <PolygonIcon />
          </ButtonContainer>
          <ButtonContainer onClick={confirmPolygon}>
            <ConfirmIcon />
          </ButtonContainer>
          <ButtonContainer onClick={onAddReferencePoint}>
            <CenterIcon />
          </ButtonContainer>
          <ButtonContainer onClick={onAddScale}>
            <LineIcon />
          </ButtonContainer>
          <ButtonContainer onClick={onAddWall}>
            <WallIcon />
          </ButtonContainer>
          <ButtonContainer onClick={CopySelection}>
            <CopyIcon />
          </ButtonContainer>
          <ButtonContainer onClick={PasteSelection}>
            <PasteIcon />
          </ButtonContainer>
          <ButtonContainer onClick={onDeleteSelection}>
            <DeleteIcon />
          </ButtonContainer>
          <ButtonContainer onClick={GroupSelection}>group</ButtonContainer>
          <ButtonContainer onClick={handleToJSON}>To JSON</ButtonContainer>
        </ButtonsContainer>
        <FabricJSCanvas className="floor-canvas" onReady={onReady} />
      </ContentContainer>
    </MainContainer>
  );
}
