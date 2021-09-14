import Reference from './Reference';
import isRefNode from './utils/isRefNode';
class ReferenceBuilder {
    constructor() {
        this.paths = [];
        this.value = '';
    }
    add(key) {
        const reference = isRefNode(key) ? key : new Reference(key);
        this.paths.push(reference);
        console.log(reference);
    }
    toString() {
        //
    }
}
export default ReferenceBuilder;
//# sourceMappingURL=ReferenceBuilder.js.map