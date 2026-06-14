(function () {

    function createStore(initialState) {
        let state = initialState;

        const listeners = [];

        function getState() {
            return state;
        }

        function setState(newState) {
            state = newState;
            notify();
        }

        function update(path, value) {
            const keys = path.split(".");
            let obj = state;

            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) {
                    obj[keys[i]] = {};
                }
                obj = obj[keys[i]];
            }

            obj[keys[keys.length - 1]] = value;

            notify();
        }

        function subscribe(fn) {
            listeners.push(fn);
        }

        function notify() {
            listeners.forEach(fn => fn(state));
        }

        return {
            getState,
            setState,
            update,
            subscribe
        };
    }

    // 🔥 FORCE GLOBAL AVAILABILITY
    window.createStore = createStore;

})();