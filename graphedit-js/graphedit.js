var id_counter = 1;

function GraphEdit(container, opt) {

    id_counter++;

    this.container = container;
    this.opt = opt;
    this.id = 'graphedit-' + id_counter;
    var elements = this.elements = [];

    if (!opt.width) opt.width = (container.style.width + '');
    if (!opt.height) opt.height = (container.style.height + '');
    if (!opt.highlight_color) opt.highlight_color = 'yellow';
    if (!opt.box_color) opt.box_color = 'rgba(0,0,0,0.1)';
    if (!opt.box_border_color) opt.box_border_color = 'rgba(0,0,0,0.2)';
    if (!opt.box_opts) opt.box_opts = 'rx="12" ry="12"';
    if (!opt.box_width) opt.box_width = (opt.grid ? opt.grid * 8 : 280);
    if (!opt.box_height) opt.box_height = (opt.grid ? opt.grid * 5 : 160);
    if (!opt.connector_color) opt.connector_color = 'green';
    if (!opt.connector_border_color) opt.connector_border_color = 'white';
    opt.default_pos = 0;

    this.container.innerHTML = '<svg id="' + this.id + '" viewBox="0 0 ' +
        opt.width.substr(0, opt.width.length - 2) + ' ' +
        opt.height.substr(0, opt.height.length - 2) +
        '" xmlns="http://www.w3.org/2000/svg"></svg>';

    var stage = this.stage = document.getElementById(this.id);
    var mouse = this.mouse = {
        button: false,
        x: 0,
        y: 0,
        drag_x: 0,
        drag_y: 0,
        selected_object: false,
    }

    var add_rect = this.add_rect = function(box_opt) {
        var box_id = 'e-' + (++id_counter);
        stage.innerHTML += '<rect id="' + box_id + '" ' +
            'style="fill:' + (box_opt.color || opt.box_color) + ';stroke-width:0;stroke:' +
            (box_opt.border_color || opt.box_border_color) + ';" ' +
            'x="' + (box_opt.x) + '" y="' + (box_opt.y) +
            '" width="' + (box_opt.width || opt.width) + '" height="' +
            (box_opt.height || opt.box_height) + '" ' + (box_opt.opts || '') + ' />';
        return (box_id);
    }

    var add_connector = this.add_connector = function(box_id, con_opt) {
        var connector_id = 'c-' + (++id_counter);
        con_opt.id = connector_id;
		con_opt.type = 'connector';
		elements.push(con_opt);

        var box = document.getElementById(box_id);
        if (!box.innerHTML) box.innerHTML = '';
        box.innerHTML += '<circle cx="50" cy="50" x="50" y="50" r="10" ' +
            ' pointer-events="visiblePoint" ' +
            ' is-connectable="true"' +
            ' style="stroke:' + (con_opt.border_color || opt.connector_border_color) +
            ';stroke-width:1;fill:' + (con_opt.border_color || opt.connector_border_color) + '" />';
    }

    var add_box = this.add_box = function(box_opt) {
        var box_id = 'e-' + (++id_counter);
        box_opt.id = box_id;
        box_opt.type = 'box';
        elements.push(box_opt);
        if (typeof box_opt.x == 'undefined') {
            opt.default_pos += (opt.grid ? opt.grid * 4 : 100);
            box_opt.x = box_opt.y = opt.default_pos;
            console.log(opt.default_pos, box_id);
        }
        stage.innerHTML += ('<g id="' + box_id + '" x="' + (box_opt.x) + '" y="' + (box_opt.y) + '" transform="translate(' + (box_opt.x) + ',' + (box_opt.y) + ')">' +
            '<rect id="b-' + box_id + '" is-draggable="true" drag="' + box_id + '" pointer-events="visiblePoint" ' +
            'style="fill:' + (box_opt.color || opt.box_color) + ';stroke-width:1;stroke:' +
            (box_opt.border_color || opt.box_border_color) + ';" ' +
            ' width="' + (box_opt.width || opt.box_width) + '" height="' +
            (box_opt.height || opt.box_height) + '" ' + (box_opt.opts || opt.box_opts) + ' /></g>');
        add_connector(box_id, {});
        return (box_id);
    }

    var make_connection_path = this.make_connection_path = function(x1, y1, x2, y2) {
        var mx1 = (x2 - x1) * 0.5;
        return ('M' + x1 + ' ' + y1 + ' ' +
            ' C' + (x1 + mx1) + ' ' + (y1) + ' ' +
            ' ' + (x1 + mx1) + ' ' + (y2) + ' ' +
            ' ' + x2 + ' ' + y2 + ' ');
    }

    var add_connection = this.add_connection = function(opt) {
        var eid = 'e-' + (++id_counter);
        opt.type = 'connection';
        opt.id = eid;
		elements.push(opt);
        stage.innerHTML += '<path id="' + eid + '" d="' + make_connection_path(opt.x1, opt.y1, opt.x2, opt.y2) + '" style="fill:none;stroke:blue;stroke-width:3;"/>';
        return (eid);
    }
    
    var remove_connection = this.remove_connection = function(eid) {
		var element = document.getElementById(eid);
		element.parentNode.removeChild(element);
	}

    var highlight_element = this.highlight_element = function(e) {
        var hl = e.getAttribute('hl');
        if (!hl) hl = opt.highlight_color;
        if (!e.getAttribute('og-color')) e.setAttribute('og-color', e.style.stroke);
        if (!e.getAttribute('og-stroke-width')) e.setAttribute('og-stroke-width', e.style['stroke-width']);
        e.style.stroke = hl;
        e.style['stroke-width'] = 4;
    }

    var unhighlight_element = this.unhighlight_element = function(e) {
        if (e.getAttribute('og-color')) {
            e.style.stroke = e.getAttribute('og-color');
            e.style['stroke-width'] = e.getAttribute('og-stroke-width');
        }
    }

    var grid_snap = this.grid_snap = function(c0) {
        if (!opt.grid) return (c0);
        return (Math.round(c0 / opt.grid) * opt.grid);
    }

    var get_element_pos = this.get_element_pos = function(e) {
        var parent = e.parentNode;
        var result = {
            x: e.getAttribute('x') * 1.0,
            y: e.getAttribute('y') * 1.0
        };
        if (parent && parent.tagName == 'g') {
            result.x += parent.getAttribute('x') * 1.0;
            result.y += parent.getAttribute('y') * 1.0;
        }
        console.log(result);
        return (result);
    }

    var clear = this.clear = function() {
		
        stage.innerHTML = '<defs><pattern id="grid" width="' +
            opt.grid + '" height="' + opt.grid + '" patternUnits="userSpaceOnUse">' +
            '<path d="M ' + opt.grid + ' 0 L 0 0 0 ' + opt.grid + '" style="stroke:rgb(0,0,0,0.1);fill:none;stroke-width:1;"/>' +
            '</pattern></defs>';

        add_rect({
            color: 'url(#grid)',
            x: 0,
            y: 0,
            width: '100%',
            height: '100%'
        });
    }

    clear();

    var default_handler = this.default_handler = {

        mousemove: (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            if (mouse.button && mouse.is_dragging) {
                var tx, ty;
                mouse.drag.setAttribute('x', tx = this.grid_snap(mouse.x + mouse.dt_x));
                mouse.drag.setAttribute('y', ty = this.grid_snap(mouse.y + mouse.dt_y));
                if (mouse.drag.tagName == 'g') {
                    // since gs don't support x and y, BUT there is no reliable way to calculate their position
                    // taking tranform() into account, we're keeping x and y attributes around as the elements basis
                    // and then we'll set the transform to force the g into position
                    mouse.drag.setAttribute('transform', 'translate(' + tx + ',' + ty + ')');
                }
            } else if (mouse.button && mouse.is_connecting) {
                mouse.path_element.setAttribute('d', make_connection_path(mouse.drag_x, mouse.drag_y, mouse.x, mouse.y));
            }
        },

        mousedown: (e) => {
            if (e.button == 0) mouse.button = true;
            mouse.drag_x = mouse.x;
            mouse.drag_y = mouse.y;
            mouse.selected_object = e.target;
            console.log('mousedown', mouse.selected_object.getAttribute('id'));
            if (mouse.selected_object) {
                mouse.drag = mouse.selected_object;
                var drag_group = mouse.selected_object.getAttribute('drag');
                if (drag_group) mouse.drag = document.getElementById(drag_group);
                mouse.is_dragging = mouse.selected_object.getAttribute('is-draggable');
                if (mouse.is_dragging) {
                    mouse.dt_x = mouse.drag.getAttribute('x') - mouse.x;
                    mouse.dt_y = mouse.drag.getAttribute('y') - mouse.y;
                    this.highlight_element(mouse.selected_object);
                }
                mouse.is_connecting = mouse.selected_object.getAttribute('is-connectable');
                if (mouse.is_connecting) {
                    console.log('connect start');
                    var dpos = get_element_pos(mouse.selected_object);
                    mouse.drag_x = dpos.x;
                    mouse.drag_y = dpos.y;
                    mouse.path_element_id = add_connection({ x1 : dpos.x, y1 : dpos.y, x2 : mouse.x, y2 : mouse.y });
                    mouse.path_element = document.getElementById(mouse.path_element_id);
                }
            } else {
                mouse.is_dragging = false;
                mouse.is_connecting = false;
            }
            // console.log(e.target.tagName, mouse);
        },

        mouseup: (e) => {
            if (e.button == 0) mouse.button = false;
            console.log('mouseup', e.target.tagName, e.target.id, mouse);
            if (mouse.is_dragging) {
                mouse.is_dragging = false;
                this.unhighlight_element(mouse.selected_object);
            }
            if (mouse.is_connecting) {
                mouse.is_connecting = false;
                if (e.target && e.target.getAttribute('is-connectable')) {
                    var dpos = get_element_pos(e.target);
                    mouse.path_element.setAttribute('d',
                        make_connection_path(mouse.drag_x, mouse.drag_y, dpos.x, dpos.y));
                } else {
					remove_connection(mouse.path_element_id);
				}
            }
        },

    }

    var on = this.on = {

        mousemove: default_handler.mousemove,
        mousedown: default_handler.mousedown,
        mouseup: default_handler.mouseup,

    }


    stage.addEventListener('mousemove', (e) => {
        if (on.mousemove) return (on.mousemove(e));
    });

    stage.addEventListener('mousedown', (e) => {
        if (on.mousedown) return (on.mousedown(e));
    });

    stage.addEventListener('mouseup', (e) => {
        if (on.mouseup) return (on.mouseup(e));
    });

    console.log('init complete');

}
