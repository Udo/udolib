var ge_count = 1;

function GraphEdit(container, opt) {

  ge_count++;

  this.container = container;  
  this.graph = {};
  this.opt = opt;
  
  if(!opt.width) opt.width = (container.style.width+'');
  if(!opt.height) opt.height = (container.style.height+'');
  
  this.container.innerHTML = '<svg id="graphedit-'+ge_count+'" viewBox="0 0 '+
    opt.width.substr(0, opt.width.length-2)+' '+
    opt.height.substr(0, opt.height.length-2)+
    '" xmlns="http://www.w3.org/2000/svg"></svg>';
    
  var stage = this.stage = document.getElementById('graphedit-'+ge_count);
    
  this.draw = function() {
    stage.innerHTML = ('<rect x="120" y="0" width="100" height="100" rx="15" ry="15" />');
  }
      
  console.log('init complete');
    
}