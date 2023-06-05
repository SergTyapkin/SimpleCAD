const config = {
  tools: [
    {
      id: 'group1',
      items: [
        { id: 1, name: 'Перемещение', icon: 'move.svg' },
        { id: 2, name: 'Удаление', icon: 'delete.svg' },
        // { id: 27, name: 'Вывод параметров объекта (выберите точку/отрезок/дугу)', icon: 'info.svg' },
        { id: 28, name: 'Информация об объекта', icon: 'info.svg' },
        { id: 3, name: 'Точка', icon: 'point.svg' },
        { id: 4, name: 'Отрезок', icon: 'line.svg' },
        { id: 14, name: 'Дуга', icon: 'arc.svg' },
      ]
    }
  ],
  constraints: [
    {
      id: 'group2',
      items: [
        { id: 5, name: 'Горизонтальность', icon: 'horizontal.svg' },
        { id: 7, name: 'Вертикальность', icon: 'vertical.svg' },
        { id: 6, name: 'Расстояние между точками / длина отрезка', icon: 'length.svg' },
        { id: 24, name: 'Расстояние между точкой и отрезком', icon: 'distance_point_line.svg' },
        { id: 8, name: 'Совмещение точек', icon: 'coincident.svg' },
        { id: 9, name: 'Фиксация точки', icon: 'fix_point.svg' },
        { id: 10, name: 'Параллельность отрезков', icon: 'parallel.svg' },
        { id: 12, name: 'Перпендикулярность отрезков', icon: 'perpendicular.svg' },
        { id: 11, name: 'Угол между отрезками', icon: 'angle.svg' },
        { id: 13, name: 'Точка на прямой', icon: 'point_on_line.svg' },
        { id: 23, name: 'Равная длина отрезков', icon: 'equal_lines.svg' },
        { id: 29, name: 'Схлопывание', icon: 'collapse.svg' },
      ]
    },
    {
      id: 'group3',
      items: [
        { id: 16, name: 'Радиус дуги', icon: 'arc_radius.svg' },
        { id: 15, name: 'Длина дуги', icon: 'arc_length.svg' },
        { id: 17, name: 'Угол дуги', icon: 'arc_angle.svg' },
        { id: 20, name: 'Касание дуги и отрезка', icon: 'arc_tangent_to_line.svg' },
        { id: 25, name: 'Перпендикулярность отрезка к радиусу дуги', icon: 'arc_line_perpendicular.svg' },
        { id: 18, name: 'Внешнее касание дуг', icon: 'arc_tangent_to_arc_outer.svg' },
        { id: 19, name: 'Внутреннее касание дуг', icon: 'arc_tangent_to_arc_inner.svg' },
      ]
    },
    {
      id: 'group4',
      items: [
        { id: 26, name: 'Длина полилинии (отрезки/дуги) [Выберите все объекты и нажмите \'Enter\']', icon: 'polyline_length.svg' },
      ]
    },
    {
      id: 'group5',
      items: [
        { id: 30, name: 'Проекция геометрии', icon: 'project.svg' },
      ]
    },
  ],
};

export default config;