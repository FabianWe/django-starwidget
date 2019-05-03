/*! Copyright 2019 Fabian Wenzelmann

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function starHandler(val, group) {
  val = group.computeVal(val);
  return function() {
    var current = group.get_val_str();
    var new_val = null;

    if (current === "") {
      // just set to new value
      new_val = val.toString(10);
    } else {
      current = parseInt(current, 10);
      if (current !== val) {
        // not the same star selected, use new value
        new_val = val.toString(10);
      } else {
        switch (group.on_selected) {
          case "empty":
            new_val = "";
            break;
          case "zero":
            new_val = group.computeVal(0).toString(10);
            break;
          case "value":
            new_val = val.toString(10);
            break;
        }
      }
    }
    $("#" + group.form_field).val(new_val);
    group.draw();
  };
}

function starFieldChangeHandler(group) {
  return function() {
    group.draw();
  };
}

function clearButtonHandler(group) {
  return function() {
    $("#" + group.form_field).val("");
    group.draw();
  };
}

class StarGroup {
  constructor(form_field, error_div, stars, filled_html, empty_html, empty_value_html, error_value_html, error_text_format, required_text, required, min_value, max_value, on_selected, display_error) {
    this.form_field = form_field;
    this.error_div = error_div;
    this.stars = stars;
    this.filled_html = filled_html;
    this.empty_html = empty_html;
    this.empty_value_html = empty_value_html;
    this.error_value_html = error_value_html;
    this.error_text_format = error_text_format;
    this.required_text = required_text;
    this.required = required;
    this.min_value = min_value;
    this.max_value = max_value;
    this.on_selected = on_selected;
    this.display_error = display_error;
  }

  draw() {
    var current_val = this.get_val_str();
    if (current_val === "") {
      this.draw_empty();
      return;
    } else {
      current_val = parseInt(current_val, 10);
    }
    current_val = this.computeVal(current_val);
    var max_full = Math.min(current_val, this.stars.length);
    var i = 0;
    for (; i < max_full; i++) {
      $("#" + this.stars[i]).html(self.filled_html);
    }
    for (; i < this.stars.length; i++) {
      $("#" + this.stars[i]).html(self.empty_html);
    }
  }

  get_val_str() {
    return $("#" + this.form_field).val();
  }

  draw_empty() {
    var n = this.stars.length;
    for (var i = 0; i < n; i++) {
      $("#" + this.stars[i]).html(self.empty_value_html);
    }
  }

  draw_error() {
    var n = this.stars.length;
    for (var i = 0; i < n; i++) {
      $("#" + this.stars[i]).html(self.error_value_html);
    }
  }

  computeVal(val) {
    if (val > this.max_value) {
      val = this.max_value;
    }
    if (val < this.min_value) {
      val = this.min_value;
    }
    return val;
  }
}

var star_groups = [];
var register_buttons = [];
var register_submit_buttons = [];

function register_star_group(group) {
  star_groups.push(group);
}

function register_clear(button_id, group) {
  register_buttons.push({
    button_id: button_id,
    group: group,
  });
}

function register_submit(button_id) {
  register_submit_buttons.push(button_id);
}


$(document).ready(function() {
    var n = star_groups.length;
    for (var i = 0; i < n; i++) {
      var group = star_groups[i];
      if (group.display_error) {
        group.draw_error();
      } else {
        group.draw();
      }
      $("#" + group.form_field).change(starFieldChangeHandler(group));
      var num_stars = group.stars.length;
      for (var j = 0; j < num_stars; j++) {
        $("#" + group.stars[j]).click(starHandler(j + 1, group));
      }
    }

    n = register_buttons.length;
    for (var i = 0; i < n; i++) {
      var next = register_buttons[i];
      var button_id = next['button_id'];
      var group = next['group'];
      $("#" + button_id).click(clearButtonHandler(group));
    }

    n = register_submit_buttons.length;
    for (var i = 0; i < n; i++) {
      var button_id = register_submit_buttons[i];
      $("#" + button_id).click(function(e) {
        console.log("submit");
        var n = star_groups.length;
        for (var i = 0; i < n; i++) {
          var group = star_groups[i];
          if (group.required && group.get_val_str() === "") {
            var err_div = $("#" + group.error_div);
            err_div.empty();
            var content = $(error_text_format);
            content.text(group.required_text);
            err_div.append(content);
            group.draw_error();
          }
        }
      });
    }
});
