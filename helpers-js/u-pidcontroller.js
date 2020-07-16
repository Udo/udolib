PIDController = {
  
  calculate : function(ep, ei, ed) {
    return(ep * this.p + ei * this.i + ed * this.d);
  },
  
  update : function(processVariable, setPoint) {
    this.current_error = setPoint - processVariable;
    this.cumulative = (this.cumulative+this.current_error)*(this.integral_decay);
    var integrated_error = 0;
    if(this.history) {
      this.hist.push(this.current_error);
      while(this.hist.length > this.history) {
        this.hist.shift();
      }
      each(this.hist, function(hv) {
        integrated_error += hv;
      });
    } else {
      integrated_error = this.cumulative;
    }
    this.current_slope = (this.current_error-this.previous_error)*(1-this.slope_smoothing) + (this.current_slope)*(this.slope_smoothing);
    this.previous_error = this.current_error;
    return(this.calculate(this.current_error, integrated_error, this.current_slope));
  },
  
  create : function(opt) {
    var c = opt;
    if(!c.history) 
      c.history = false;
    if(!c.slope_smoothing)
      c.slope_smoothing = 0.0;
    if(!c.integral_decay)
      c.integral_decay = 1.0;
    c.cumulative = 0;
    c.current_slope = 0;
    c.current_error = 0;
    c.previous_error = 0;
    c.hist = [];
    c.calculate = PIDController.calculate.bind(c);
    c.update = PIDController.update.bind(c);
    return(c);
  },
  
}

PIDModel = {
  
  immediate : function() {
    return(function(processVariable) {
      return(processVariable);
    });
  },

  additive : function() {
    var current_state = 0;
    return(function(processVariable) {
      current_state += processVariable;
      return(current_state);
    });
  },

  sinus : function() {
    var current_state = 0;
    var current_index = 0;
    return(function(processVariable) {
      current_index += 0.1;
      current_state += processVariable + 0.1*Math.sin(current_index);
      return(current_state);
    });
  },

  slow : function() {
    var current_state = 0;
    var carried_pv = 0;
    return(function(processVariable) {
      carried_pv = carried_pv*0.8 + processVariable*0.2;
      current_state += carried_pv;
      return(current_state);
    });
  },

  fast : function() {
    var current_state = 0;
    return(function(processVariable) {
      current_state += 2*processVariable;
      return(current_state);
    });
  },

  decaying : function() {
    var current_state = 0;
    return(function(processVariable) {
      current_state = 0.8*current_state+processVariable;
      return(current_state);
    });
  },
  
}