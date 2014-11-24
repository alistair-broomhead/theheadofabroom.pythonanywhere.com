/*
 * Allows elements of
 */
function createAccordions(document){

        var i, j, k;
        var sidebar = document.getElementById("sidebar");
        var h = document.createElement('h5');
        h.innerHTML = "On this page:";
        sidebar.appendChild(h);
        var divs = document.getElementById("content").getElementsByTagName("div");
        var headingTags = ["h1", "h2", "h3", "h4"];
        for (i = 0; i < divs.length; i++){
            var div = divs[i];
            if (div.hasOwnProperty("id") && div.id){
                var heading = null;
                for (j = 0;
                     j < headingTags.length && heading === null;
                     j++){
                    var newHeadings = div.getElementsByTagName(headingTags[j]);
                    for (k = 0;
                         k < newHeadings.length && heading === null;
                         k++ ){
                        var newHeading = newHeadings[k];
                        if (newHeading.parentNode == div){
                            heading = newHeading;
                        }
                    }
                }
                if (heading !== null){
                    var link = document.createElement("a");
                    link.href = "#" + div.id;
                    link.innerHTML = heading.innerHTML;
                    var para = document.createElement("p");
                    para.appendChild(link);
                    sidebar.appendChild(para);
                }
            }
        }

        var accordionElements = document.getElementsByClassName("accordion");

        function Accordion(div){
            this.div = div;
            this.div.accordion = this;
            this.heading = div.getElementsByClassName("heading")[0];

            var self = this;
            this.heading.onclick = function(){self.toggle();};
        }
        Accordion.prototype = {
            div: null,

            toggle: function toggle(){
                var classList = this.div.classList;
                if (classList.contains('contracted')){
                    classList.remove('contracted');
                } else {
                    classList.add('contracted');
                }
            }
        };

        for (i = 0, j = accordionElements.length ; i < accordionElements.length; i++){
            var el = accordionElements[i];
            var a = new Accordion(el);
            function toggleAccordion(a){
                // Need to fix reference to accordion
                function toggleAccordion(){
                    a.toggle();
                }
                return toggleAccordion;
            }
            if (i > 0){
                setTimeout(toggleAccordion(a),  (j-i) * 120);
            }
        }
}