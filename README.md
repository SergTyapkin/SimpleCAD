# SimpleCAD

### Constraints
| Constraint | Описание |
|----------  |--------|
|HORIZONTAL  | Горизонтальность
|VERTICAL    | Вертикальность
|LENGTH      | Длина прямой
|FIX_POINT   |Фиксация точки
|COINCIDENT  |Совпадение точек
|PARALLEL    | Параллельность прямых
|PERPENDICULAR   | Перпендикулярность прямых
|POINT_ON_LINE   | Принадлежность точки прямой
|ANGLE   | Угол между прямыми
|EQUAL_LINES | Равная длина прямых
|DISTANCE_POINT_LINE | Расстояние между точкой и прямой
|ARC_LENGTH  | Длина дуги
|ARC_RADIUS  | Радиус дуги
|ARC_ANGLE   | Угол дуги
|ARC_TANGENT_ToArc| Касание дуг окружностей (внешнее(OUT) и внутреннее(IN))
|ARC_TANGENT_ToLine| Касание дуги и прямой
|ARC_POINT_COINCIDENT | Совмещение точки и конца дуги (1-начальная т., 2-конечная т.)
|ARC_POINT_FIX | Фиксация конца дуги (1-начальная т., 2-конечная)
|LENGTH_TOTAL | Длина кривой, кривой, состоящей из нескольких участков (отрезков/дуг)

Example:
```javascript
    //  Points and lines
    Constraint({type: ConstraintsTypes.HORIZONTAL, points: [point1, point2]});
    Constraint({type: ConstraintsTypes.VERTICAL, points: [point1, point2]});
    Constraint({type: ConstraintsTypes.LENGTH, points: [point1, point2], value: 32});
    Constraint({type: ConstraintsTypes.FIX_POINT, points: [point2]});
    Constraint({type: ConstraintsTypes.COINCIDENT, points: [point0, point2]});
    Constraint({type: ConstraintsTypes.PARALLEL, lines: [[point2, point1], [point3, point4]]});
    Constraint({type: ConstraintsTypes.PERPENDICULAR, lines: [[point2, point1], [point3, point4]]});
    Constraint({type: ConstraintsTypes.POINT_ON_LINE, lines: [[point1, point2]], points: [point3]});
    Constraint({type: ConstraintsTypes.ANGLE,
                lines: [[point3, point1], [point2, point4]],
                value: {val: 60, mode: 'DEG'}}); //  {val: 1.0471975511965976, mode: 'RAD'}
    Constraint({type: ConstraintsTypes.EQUAL_LINES, lines: [[point0, point1], [point1, point2]]})
    Constraint({type: ConstraintsTypes.DISTANCE_POINT_LINE, lines: [[point1, point2]], points: [point4], value: 70});
    
    //  Arcs
    Constraint({type: ConstraintsTypes.ARC_LENGTH, elements: [arc1], value: 20});
    Constraint({type: ConstraintsTypes.ARC_RADIUS, elements: [arc1], value: 5});
    Constraint({type: ConstraintsTypes.ARC_ANGLE, elements: [arc1], value: 45});
    Constraint({type: ConstraintsTypes.ARC_TANGENT_ToArc, elements:[arc1, arc2], mode: 'IN'}); // mode: 'IN' | 'OUT'
    Constraint({type: ConstraintsTypes.ARC_TANGENT_ToLine, elements:[arc1], lines: [[point3, point2]]});
    Constraint({type: ConstraintsTypes.ARC_POINT_COINCIDENT, elements:[arc1], points: [point2], mode: 1}); // mode: 1|2
    Constraint({type: ConstraintsTypes.ARC_POINT_FIX, elements:[arc1], mode: 1}); // mode: 1|2
    Constraint({type: ConstraintsTypes.ARC_LINE_PERPENDICULAR, elements:[arc1], lines: [[point3, point2]], mode: 1}); // mode: 1 - start point of arc, 2 - end point of arc

    //  Сomplex
    Constraint({type: ConstraintsTypes.LENGTH_TOTAL, elements: [line1, arc1, line2], value: 250})
```


Using the `KERNEL`:
```javascript
// call `solve` method for solving system
kernel.solve(points, elements, constraints);
```
```typescript
Kernel.solve(points: Array<Point>, elements: Array<Arc | Line>, constraints: Array<Constraint>) {...}
```
