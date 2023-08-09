module.exports = {
    name: "error",
    async execute(error) {
        console.error("A bot a következő hibába ütközött: ", error);
    }
};