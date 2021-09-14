declare class Gitlab {
    #private;
    constructor(token: any);
    getProjects(): Promise<any>;
}
export default Gitlab;
