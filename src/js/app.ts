import { IGridProperties } from './Types';
import { GridRenderStyle } from './Types';
import { Grid } from './Grid';
import { Trace } from './Trace';
import  data from '../testdata/data.1000.json';
import  model from '../testdata/data.model.json';

import '../css/grid.scss';


document.addEventListener('DOMContentLoaded', () => {

  let trc = new Trace('app');
  trc.time('table');

  let body = document.getElementsByTagName('body')[0];

  let div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.left = '0';
  div.style.top = '0';
  div.style.width = '100%';
  div.style.height = '100%';
  // div.style.left = '100px';
  // div.style.top = '100px';
  // div.style.width = '500px';
  // div.style.height = '488px';
  // div.style.border = '1px solid blue';
  // div.style.backgroundColor = 'lightblue';
  body.append(div)

  let tableConfig: IGridProperties = {
    width: div.offsetWidth,
    height: div.offsetHeight,
    rows: 100,
    columns: 30,
    columnWidths: [40, 80, 200, 120, 80, 40, 80, 200, 120, 80, 40, 80, 200, 120, 80, 40, 80, 200, 120, 80, 40, 80, 200, 120, 80, 40, 80, 200, 120, 80],
    // columnWidths: [],
    firstVisibleColumn: 1,
    firstVisibleRow: 1,
    fixedColumns: 0,
    fixedRows: 0,
    id: 'grid',
    rowHeaderWidth: 50,
    rowHeight: 25,
    scrollLeft: 0,
    scrollTop: 0,
    scrollToSnap: true,
    renderStyle: GridRenderStyle.table,
    data: data,
    model: model
  }
  // var table = new Grid({
  //   id: 'my',
  //   columns: 20,
  //   rows: 200,
  //   rowHeight: 25,
  //   width: body.offsetWidth,
  //   height: body.offsetHeight,
  // });
  var table = new Grid(tableConfig);

  table.create();
  table.appendTo(div);
  trc.timeEnd('table');
});
