import { GridContainer } from "./GridContainer";
import { IGridContainer } from "./Types";
import { IGridPropertiesInternal } from './Types';
import { IGridSkeleton } from "./Types";

export class Skeleton implements IGridSkeleton {

  private _c: IGridContainer;
  private _rchc: IGridContainer;
  private _rchg: IGridContainer;
  private _chc: IGridContainer;
  private _chg: IGridContainer;
  private _rhc: IGridContainer;
  private _rhg: IGridContainer;
  private _bc: IGridContainer;
  private _cmc: IGridContainer;
  private _cmg: IGridContainer;
  private _sc: IGridContainer;
  private _scs: IGridContainer;

  constructor(config: IGridPropertiesInternal) {
    this._c = new GridContainer()
      .setId(`${config.id}-container`)
      .addClassName('container')
      .setHeight(`100%`)
      .setWidth(`100%`);

    this._rchc = new GridContainer()
      .setId(`${config.id}-row-column-header-container`)
      .addClassName(`row-column-header-container`)
      .setHeight(config.rowHeight)
      .setWidth(config.rowHeaderWidth)
      .appendTo(this.c.getDomRef());

    this._rchg = new GridContainer();

    this._chc = new GridContainer()
      .setId(`${config.id}-column-header-container`)
      .addClassName(`column-header-container`)
      .setLeft(config.rowHeaderWidth)
      .setHeight(config.rowHeight)
      .setWidth(config.width - config.scrollbarSize - config.rowHeaderWidth)
      .appendTo(this.c.getDomRef())

    this._chg = new GridContainer();

    this._rhc = new GridContainer()
      .setId(`${config.id}-row-header-container`)
      .addClassName(`row-header-container`)
      .setTop(config.rowHeight)
      // .setHeight(config.visibleRows * config.rowHeight)
      .setHeight(config.height - config.rowHeight - config.scrollbarSize)
      .setWidth(config.rowHeaderWidth)
      .appendTo(this.c.getDomRef());

    this._rhg = new GridContainer();

    this._bc = new GridContainer()
      .setId(`${config.id}-body-container`)
      .addClassName(`body-container`)
      .setTop(config.rowHeight)
      .setLeft(config.rowHeaderWidth)
      // .setHeight(config.visibleRows * config.rowHeight)
      .setHeight(config.height - config.rowHeight - config.scrollbarSize)
      .setWidth(config.width - config.scrollbarSize - config.rowHeaderWidth)
      .appendTo(this.c.getDomRef());

    this._cmc = new GridContainer()
      .setId(`${config.id}-center-middle-body-container`)
      .addClassName(`center-middle-body-container`)
      .setTop(config.rowHeight)
      .setLeft(config.rowHeaderWidth)
      // .setHeight(config.visibleRows * config.rowHeight)
      .setHeight(config.height - config.rowHeight - config.scrollbarSize)
      .setWidth(config.width - config.scrollbarSize - config.rowHeaderWidth)
      .appendTo(this.bc.getDomRef());

    this._cmg = new GridContainer();

    this._sc = new GridContainer()
      .setId(`${config.id}-scroll-container`)
      .addClassName(`scroll-container`)
      .setTop(config.rowHeight)
      .setLeft(config.rowHeaderWidth)
      // .setHeight(config.visibleRows * config.rowHeight + config.scrollbarSize)
      .setHeight(config.height - config.rowHeight)
      .setWidth(config.width - config.rowHeaderWidth)
      .appendTo(this.c.getDomRef());

    this._scs = new GridContainer()
      .setId(`${config.id}-scroll-container-shim`)
      .addClassName(`scroll-container-shim`)
      .appendTo(this.sc.getDomRef());
  }

  public get c() { return this._c; }
  public get rchc() { return this._rchc; }
  public get rchg() { return this._rchg }
  public get chc() { return this._chc; }
  public get chg() { return this._chg; }
  public get rhc() { return this._rhc; }
  public get rhg() { return this._rhg; }
  public get bc() { return this._bc; }
  public get cmc() { return this._cmc; }
  public get cmg() { return this._cmg; }
  public get sc() { return this._sc; }
  public get scs() { return this._scs; }

  public set c(c: IGridContainer) { this._c = c; }
  public set rchc(c: IGridContainer) { this._rchc = c; }
  public set rchg(c: IGridContainer) { this._rchg = c; }
  public set chc(c: IGridContainer) { this._chc = c; }
  public set chg(c: IGridContainer) { this._chg = c; }
  public set rhc(c: IGridContainer) { this._rhc = c; }
  public set rhg(c: IGridContainer) { this._rhg = c; }
  public set bc(c: IGridContainer) { this._bc = c; }
  public set cmc(c: IGridContainer) { this._cmc = c; }
  public set cmg(c: IGridContainer) { this._cmg = c; }
  public set sc(c: IGridContainer) { this._sc = c; }
  public set scs(c: IGridContainer) { this._scs = c; }
}