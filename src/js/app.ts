import { ITableProperties } from './Types';
import { TableRenderStyle } from './Types';
import { Table } from './Table';

import '../css/table.scss';


document.addEventListener('DOMContentLoaded', () => {

  console.time('table');

  let body = document.getElementsByTagName('body')[0];

  let div = document.createElement('div');
  div.style.position = 'fixed';
  // div.style.left = '0';
  // div.style.top = '0';
  // div.style.width = '100%';
  // div.style.height = '100%';
  div.style.left = '100px';
  div.style.top = '100px';
  div.style.width = '500px';
  div.style.height = '488px';
  // div.style.border = '1px solid blue';
  // div.style.backgroundColor = 'lightblue';
  body.append(div)

  let tableConfig: ITableProperties = {
    width: div.offsetWidth,
    height: div.offsetHeight,
    rows: 100,
    columns: 20,
    // columnWidths: [40, 80, 200, 120, 80, 40, 80, 200, 120, 80, 40, 80, 200, 120, 80, 40, 80, 200, 120, 80],
    columnWidths: [],
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
    renderStyle: TableRenderStyle.table
  }
  // var table = new Table({
  //   id: 'my',
  //   columns: 20,
  //   rows: 200,
  //   rowHeight: 25,
  //   width: body.offsetWidth,
  //   height: body.offsetHeight,
  // });
  var table = new Table(tableConfig);

  table.create();
  table.appendTo(div);
  console.timeEnd('table');
});
