(function(win, doc, undefined){

    // helpers

    var level = 1, // track the level/depth we are currently in
        indexes = { "level 0": [0] }; // track the "index" we are on. in other word the index of the li in the current ul level

    var cb;	// hold internal reference to call back. I decided to hold this privately instead of publically for now. might change in the future

    var fragment = doc.createDocumentFragment("div"); // fragment to build the tree to that will eventually be appended to the element passed

    /*
     *
     * Traverse the entire object and build the corresponding ul
     *
     * @param {JSON/Object} the JSON or plain JS object to traverse
     * @return {Element} the Ul element
     */
    function traverse(obj) {

        var keys = Object.keys(obj);

        var parentUl = doc.createElement("ul");
        parentUl.setAttribute("class", "jv-level-" + level);

        if ( !indexes["level " + level] ) indexes["level " + level] = [];

        for ( var i = 0, len = keys.length; i < len; i++ ) {

            indexes["level " + level].push(i);

            var parentLi = doc.createElement("li");
            parentLi.setAttribute("class", "jv-li jv-type-" + typeof(obj[keys[i]]));
            ( obj instanceof Array ) ? parentLi.innerHTML = "Index " + keys[i] : parentLi.innerHTML = keys[i];

            if ( typeof(obj[keys[i]]) === "object" && obj[keys[i]] !== null ) {

                level++;

                parentLi.appendChild(traverse(obj[keys[i]]));
                parentUl.appendChild(parentLi);

            } else {

                var childUl = doc.createElement("ul");
                childUl.setAttribute("id", "jv-level-" + level + "-" + indexes["level " + level][i]);

                parentLi.appendChild(childUl);

                var childLi = doc.createElement("li");
                childUl.setAttribute("class", "jv-li");
                childUl.appendChild(childLi);

                if ( obj[keys[i]] === null ) {
                    childLi.innerHTML = "null"
                } else if ( typeof(obj[keys[i]]) === "function" ) {
                    childLi.innerHTML = "Function";
                    childLi.setAttribute("data-function", obj[keys[i]].toString());
                } else {
                    childLi.innerHTML = obj[keys[i]];
                }

                parentUl.appendChild(parentLi);

            }

        }

        level--;

        return parentUl;

    }

    /*
     *
     * Traverse the object to return the depth of it
     *
     * @param {JSON/Object} the JSON or plain JS object to traverse
     * @return {Number} the depth of the JSON or plain JS object
     *
     */
    function depthOf(object) {
        var level = 1;
        var key;
        for(key in object) {
            if (!object.hasOwnProperty(key)) continue;

            if(typeof object[key] == 'object'){
                var depth = depthOf(object[key]) + 1;
                level = Math.max(depth, level);
            }
        }
        return level;
    }

    // Constructor
    var JsonViz = function(){};

    // Prototype
    JsonViz.prototype = {

        /*
         *
         * Hold reference to the element we want to append to
         *
         * @property element
         * @type {Element}
         * @default null
         */
        element: null,

        /*
         *
         * Hold reference to the element we want to append to
         *
         * @property element
         * @type {Element}
         * @default null
         */
        obj: null,

        /*
         *
         * Take in a JSON or plain JS object and convert it
         * to a usable ul tree
         *
         * @method append
         * @param {Object} json or plain object
         * @return {this} reference to this instance
         */
        append: function(obj) {
            this.obj = obj;
            fragment.appendChild(traverse(obj));
            return this;
        },

        /*
         *
         * Element to append the output to
         *
         * @method to
         * @param {String}
         * @return {this} reference to this instance
         */
        to: function(element) {
            this.element = element;
            return this;
        },

        /*
         *
         * Invoke a callback function after
         * output is appended
         *
         * @mathod done
         * @param {Function}
         * @return {this} reference to this instance
         */
        done: function(callback) {
            doc.querySelector(this.element).appendChild(fragment);
            cb = callback;
            callback();
            return this;
        },

        /*
         * New JSON or plain JS object to update the
         * the tree with
         *
         * NOTE: this will recreate the entire tree
         *
         * @method update
         * @param {JSON/Object} JSON or plain JS object to update tree with
         * @return {undefined}
         */
        update: function(obj) {
            // TODO: remove current tree before appending
            this.append(obj).to(this.element).done(cb);
        },

        /*
         *
         * Get the depth of the entire tree
         *
         * @method getDepth
         * @return {Number} the depth
         */
        getDepth: function() {
            return depthOf(this.obj);
        },

        /*
         *
         * These are simply place holders for now. The idea is to be
         * able to specifiy the version of Bootstrap or Foundation
         * and the tree will be built according to the HTML each
         * one requires for the top nav component.
         *
         */
        forBootstrap: function(){},
        forFoundation: function(){}

    }

    win.JsonViz = JsonViz;

}(this, document, undefined));