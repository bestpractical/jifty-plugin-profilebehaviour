/*
    This Jifty Behaviour has been modified to keep track of timing
    information and render it to an on-screen display for profiling
    purposes
*/   

var Behaviour = {
    profileData: {
        calls: [],
        applyTime: 0,
        searchTime: 0,
        numCalls: 0
    },

    list: [],
    
    register: function(sheet) {
        Behaviour.list.push(sheet);
    },
    
    apply: function() {
        var root = arguments[0];
        var profile = {
            searchTimes: {},
            applyTimes: {},
            funcs: {},
            searchTime: 0,
            applyTime: 0,
            caller: Behaviour.apply.caller
        };

        for (var h = 0; sheet = Behaviour.list[h]; h++) {
            for (var selector in sheet) {

                var start = new Date();
                var elements = jQuery(selector, root);
                var done  = new Date();

                profile.searchTimes[selector] = done - start;
                profile.searchTime += profile.searchTimes[selector];
                
                start = new Date();
                elements.each(function() { 
                    sheet[selector](this);
                });
                done  = new Date();

                profile.applyTimes[selector] = done - start;
                profile.applyTime += profile.applyTimes[selector];
                profile.funcs[selector] = sheet[selector];
            }
        }

        Behaviour.profileData.calls.push(profile);
        Behaviour.profileData.numCalls++;
        Behaviour.profileData.searchTime += profile.searchTime;
        Behaviour.profileData.applyTime += profile.applyTime;
    },

    showProfile: function() {
        var pane = this.createElement('div');
        pane.id = 'behaviour-profile-data';

        var title = this.createElement('div');
        title.appendChild(document.createTextNode('Behaviour profiling information'));
        title.className = 'title';
        var close = this.createElement('a', 'close', '[close]');
        close.href = '#';
        close.onclick = function() { jQuery('#behaviour-profile-data').remove(); };

        pane.appendChild(close);
        pane.appendChild(title);
        
        pane.appendChild(Behaviour._callData());

        document.getElementsByTagName('body')[0].appendChild(pane);

    },

    _callData: function() {
        list = this.createElement('ul', 'section');

        for( var i = 0; i <  Behaviour.profileData.calls.length; i++ ) {
            var call = Behaviour.profileData.calls[i];
            var item = this.createElement('li', 'call');
            var text = call.caller.length == 0 ? ' (Page load)' : ' (AJAX)';
            var title = this.createElement('div', 'title', 'Call ' + i + text);
            item.appendChild(title);
            
            var table = this.createElement('table');
            var head = this.createElement('tr');
            head.appendChild(this.createElement('th', 'selector', 'Selector'));
            head.appendChild(this.createElement('th', 'time search', 'Query time (ms)'));
            head.appendChild(this.createElement('th', 'time apply', 'Apply time (ms)'));
            head.appendChild(this.createElement('th', 'time total', 'Total time (ms)'));
            head.appendChild(this.createElement('th'));
            table.appendChild(head);

            var keys = [];
            jQuery.each(call.searchTimes, function(k,v) {
                keys.push( k );
            });

            var searchTimes = keys.sort(function(a,b) {
                var timeA = call.searchTimes[a] + call.applyTimes[a];
                var timeB = call.searchTimes[b] + call.applyTimes[b];
            
                if(timeA < timeB) {
                    return 1;
                } else if(timeA > timeB) {
                    return -1;
                } else {
                    return 0;
                }
            });
            
            for(var j = 0; j < searchTimes.length; j++) {
                var k = searchTimes[j];
                var tr = this.createElement('tr');
                tr.appendChild(this.createElement('td', 'selector', k));
                tr.appendChild(this.createElement('td', 'time search', call.searchTimes[k]));
                tr.appendChild(this.createElement('td', 'time apply', call.applyTimes[k]));
                tr.appendChild(this.createElement('td', 'time total', call.searchTimes[k] + call.applyTimes[k]));

                var code  = this.createElement('td', 'code');
                var a = this.createElement('a', null, '[code]');
                a.href = '#';
                var src = this.createElement('code', null, call.funcs[k]);
                var id = 'code-' + i + '-' + j;
                src.id = id;
                src.style.display = 'none';
                // Kludge to make the onclick function close over id properly
                (function (id) {
                    a.onclick = function() { jQuery('#'+id).toggle(); return false; }
                })(id);

                var div = this.createElement('div');
                div.appendChild(src);
                code.appendChild(div);
                code.appendChild(a);
                tr.appendChild(code);
                table.appendChild(tr);
            }

            item.appendChild(table);

            item.appendChild(this.createElement('div','totals',
                                                'Total: '
                                                + call.searchTime + 'ms search, '
                                                + call.applyTime + 'ms apply, '
                                                + (call.searchTime + call.applyTime) + 'ms total'));
                                           
            
            list.appendChild(item);
        }
        
        return list;
    },


    // Convenience method for the above
    createElement: function (elt, className, text) {
        elt = elt ? elt : 'div';
        var d = document.createElement(elt);
        if(className) d.className = className;
        if(text) d.appendChild(document.createTextNode(text));
        return d;
    },

    onLoad: function () {
        // Make sure we only run once
        if (Behaviour.loaded) return;
        Behaviour.loaded = true;
        Behaviour.apply();

        var open = this.createElement('a', null, 'Behaviour profile');
        open.id = 'show-behaviour-profile';
        open.href ='#';
        open.onclick = function() { Behaviour.toggleProfile() }
        var div = this.createElement('div');
        div.appendChild(open);
        document.getElementsByTagName('body')[0].appendChild(div);
    },

    toggleProfile: function () {
        var e = jQuery('#behaviour-profile-data');
        if (e.length) {
            e.remove();
        } else {
            this.showProfile();
        }
    }
};

(function($) {
    $(document).ready(function(){
        Behaviour.onLoad();
    });
})(jQuery);

