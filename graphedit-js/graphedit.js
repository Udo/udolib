var id_counter = 1;

function GraphEdit(container, options) {

    id_counter++;

    this.container = container;
    this.data = {
	    options : options,
	    boxes : {},
    };
    this.id = 'graphedit-' + id_counter;

    if (!options.width) options.width = (container.style.width + '');
    if (!options.height) options.height = (container.style.height + '');
    if (!options.highlight_color) options.highlight_color = 'yellow';
    if (!options.box_color) options.box_color = 'rgba(0,0,0,0.1)';
    if (!options.box_border_color) options.box_border_color = 'rgba(0,0,0,0.2)';
    if (!options.opts) options.opts = 'rx="12" ry="12"';
    if (!options.box_width) options.box_width = (options.grid ? options.grid * 8 : 280);
    if (!options.box_height) options.box_height = (options.grid ? options.grid * 5 : 160);
    if (!options.connector_color) options.connector_color = 'green';
    if (!options.connector_border_color) options.connector_border_color = 'white';
    options.default_pos = 0;

    var stage = false;
    var mouse = this.mouse = {
        button: false,
        x: 0,
        y: 0,
        drag_x: 0,
        drag_y: 0,
        selected_object: false,
    }
    
    var render_connectors = (opt) => {
	    var r = '';
	    opt.connectors.forEach((con, idx) => {
		    r += '<circle cx="50" cy="50" r="10" transform="translate(' + (con.x) + ',' + (con.y) + ')" ' +
            ' pointer-events="visiblePoint" ' +
            ' is-connectable="true"' +
            ' style="stroke:' + (con.border_color || options.connector_border_color) +
            ';stroke-width:1; fill:' + (con.border_color || options.connector_border_color) + '" />';
	    });
	    return(r);
    }
    
    var render_box = (opt) => {
	    return('<g id="' + opt.id + '" x="' + (opt.x) + 
        	'" y="' + (opt.y) + '" transform="translate(' + (opt.x) + ',' + (opt.y) + ')">' +
            '<rect id="b-' + opt.id + '" is-draggable="true" drag="' + opt.id + 
            '" pointer-events="visiblePoint" ' +
            'style="fill:' + (opt.color || options.box_color) + ';stroke-width:1;stroke:' +
            (opt.border_color || options.box_border_color) + ';" ' +
            ' width="' + (opt.width || options.box_width) + '" height="' +
            (opt.height || options.box_height) + '" />'+render_connectors(opt)+'</g>');
    }
    
    var render_boxes = () => {
		var r = '';
		for (var key in this.data.boxes) if (this.data.boxes.hasOwnProperty(key)) {
			r += render_box(this.data.boxes[key]);	
		}
		return(r);
    }
    
	var render_rect = function(opt) {
        var box_id = 'e-' + (++id_counter);
        return('<rect id="' + box_id + '" ' +
            'style="fill:' + (opt.color || options.box_color) + ';stroke-width:0;stroke:' +
            (opt.border_color || options.box_border_color) + ';" ' +
            'x="' + (opt.x) + '" y="' + (opt.y) +
            '" width="' + (opt.width || options.width) + '" height="' +
            (opt.height || options.box_height) + '" />');
    }
    
    var render_grid = () => {
	    return('<defs><pattern id="grid" width="' +
            options.grid + '" height="' + options.grid + '" patternUnits="userSpaceOnUse">' +
            '<path d="M ' + options.grid + ' 0 L 0 0 0 ' + options.grid +
             '" style="stroke:rgb(0,0,0,0.1);fill:none;stroke-width:1;"/>' +
            '</pattern></defs>'+render_rect({
	            color: 'url(#grid)',
	            x: 0,
	            y: 0,
	            width: '100%',
	            height: '100%'
	    }));
    }
    
    this.on = {

        mousemove : (e) => {
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
                mouse.path_element.setAttribute('d', 
                	make_connection_path(mouse.drag_x, mouse.drag_y, mouse.x, mouse.y));
            }
        },

        mousedown : (e) => {
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

        mouseup : (e) => {
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

	this.render = () => {
		var content = '<svg id="' + this.id + '" viewBox="0 0 ' +
	        options.width.substr(0, options.width.length - 2) + ' ' +
	        options.height.substr(0, options.height.length - 2) +
	        '" xmlns="http://www.w3.org/2000/svg">'+
	        	render_grid()+
	        	render_boxes()+'</svg>';
	    console.log(content);
	    this.container.innerHTML = content;
	    stage = document.getElementById(this.id);

	    stage.addEventListener('mousemove', this.on.mousemove);
	    stage.addEventListener('mousedown', this.on.mousedown);
	    stage.addEventListener('mouseup', this.on.mouseup);	
	} 

    var add_box = this.add_box = (opt) => {
        opt.id ='e-' + (++id_counter);
        opt.type = 'box';
        if (typeof opt.x == 'undefined') {
            options.default_pos += (options.grid ? options.grid * 4 : 100);
            opt.x = opt.y = options.default_pos;
        }
        opt.connectors = [];
        opt.connectors.push({ type : 'in', x : 1, y : 1 });
        this.data.boxes[opt.id] = opt;
		this.render();
    }

    var make_connection_path = this.make_connection_path = (x1, y1, x2, y2) => {
        var mx1 = (x2 - x1) * 0.5;
        return ('M' + x1 + ' ' + y1 + ' ' +
            ' C' + (x1 + mx1) + ' ' + (y1) + ' ' +
            ' ' + (x1 + mx1) + ' ' + (y2) + ' ' +
            ' ' + x2 + ' ' + y2 + ' ');
    }

    var add_connection = this.add_connection = (opt) => {
        var eid = 'e-' + (++id_counter);
        opt.type = 'connection';
        opt.id = eid;
		elements.push(opt);
        stage.innerHTML += '<path id="' + eid + '" d="' + 
        	make_connection_path(opt.x1, opt.y1, opt.x2, opt.y2) + 
        	'" style="fill:none;stroke:blue;stroke-width:3;"/>';
        return (eid);
    }
    
    var remove_connection = this.remove_connection = (eid) => {
		var element = document.getElementById(eid);
		element.parentNode.removeChild(element);
	}

    var highlight_element = this.highlight_element = (e) => {
        var hl = e.getAttribute('hl');
        if (!hl) hl = opt.highlight_color;
        if (!e.getAttribute('og-color')) e.setAttribute('og-color', e.style.stroke);
        if (!e.getAttribute('og-stroke-width')) e.setAttribute('og-stroke-width', e.style['stroke-width']);
        e.style.stroke = hl;
        e.style['stroke-width'] = 4;
    }

    var unhighlight_element = this.unhighlight_element = (e) => {
        if (e.getAttribute('og-color')) {
            e.style.stroke = e.getAttribute('og-color');
            e.style['stroke-width'] = e.getAttribute('og-stroke-width');
        }
    }

    var grid_snap = this.grid_snap = (c0) => {
        if (!opt.grid) return (c0);
        return (Math.round(c0 / opt.grid) * opt.grid);
    }

    var get_element_pos = this.get_element_pos = (e) => {
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

    this.render();

    console.log('init complete');

}
