export class Trace {

    private color: string;
    private component: string;

    private static predefinedColors: string[] = ['violet', 'cyan', 'limegreen', 'deepskyblue', 'darkgoldenrod', 'chocolate', 'gold'];
    private static components: string[] = [];
    private static colors = 0;

    constructor(component: string, color?: string) {
        let existIndex = Trace.components.indexOf(component);
        if (existIndex !== -1) {
            this.color = Trace.predefinedColors[existIndex];
        }
        else {
            if (color) {
                // custom color; insert at current position
                Trace.predefinedColors.splice(Trace.components.length, 0, color);
                // get resulting index of new color
                let newIndex = Trace.predefinedColors.indexOf(color);
                // add component at the same index as its custom color
                Trace.components[newIndex] = component;
            }
            else {
                Trace.components.push(component);
            }
            this.color = color || Trace.predefinedColors[Trace.colors++];
        }
        this.component = component;
    }
    public assert(...args: any) {
      args.splice(1, 0, this.component);
      console.assert(...args);
    }
    public error(msg: string) {
        console.error(`${this.component}: ${msg}`);
    }
    public info(msg: any) {
        console.info(`%c${this.component}: ${msg}`, `color: ${this.color};`);
    }
    public log(msg: any) {
        console.log(`%c${this.component}: ${msg}`, `color: ${this.color};`)
    }
    public table(...args: any) {
        console.table(...args);
    }
    public time(label: string) {
        console.time(`${this.component} - ${label}`);
    }
    public timeEnd(label: string) {
        console.timeEnd(`${this.component} - ${label}`);
    }
    public trace(...args: any) {
        console.trace(this.component, ...args);
    }
    public warn(msg: string) {
        console.warn(`${this.component}: ${msg}`);
    }
}