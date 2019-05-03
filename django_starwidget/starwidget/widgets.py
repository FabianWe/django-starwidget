# Copyright 2019 Fabian Wenzelmann
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


from django.forms.widgets import NumberInput
from django.conf import settings
from django.utils.translation import gettext_lazy


class StarWidget(NumberInput):
    template_name = 'starwidget/star.html'

    star_filled_fa = '<i class="fas fa-star fa-lg" style="color:gold;"></i>'
    star_empty_fa = '<i class="far fa-star fa-lg" style="color:gold;"></i>'
    star_empty_value_fa = '<i class="fas fa-star fa-lg" style="color:#E0E0E0;"></i>'
    star_error_fa = '<i class="far fa-star fa-lg" style="color:#ff6666;"></i>'
    clear_fa = '<i class="fas fa-broom" style="color:orange;"></i>'
    default_error_text_format = '<span style="color:#ff6666;"></span>'
    default_required_text = gettext_lazy('This field is required')

    def __init__(self, attrs=None, filled_style=None, empty_style=None,
                 empty_value_style=None, clear_style=None, error_style=None,
                 error_text_format=None, required_text=None, clear='never',
                 on_selected='empty', display_input=False,
                 submit_button=None, *args, **kwargs):
        super().__init__(attrs, *args, **kwargs)
        if filled_style is None:
            filled_style = self.star_filled_fa
        if empty_style is None:
            empty_style = self.star_empty_fa
        if empty_value_style is None:
            empty_value_style = self.star_empty_value_fa
        if clear_style is None:
            clear_style = self.clear_fa
        if error_style is None:
            error_style = self.star_error_fa
        if error_text_format is None:
            error_text_format = self.default_error_text_format
        if required_text is None:
            required_text = self.default_required_text
        if clear not in ['if-not-required', 'always', 'never']:
            raise ValueError('"clear" must be either "if-not-required", "always" or "never", got "%s' % str(clear))
        if on_selected not in ['empty', 'zero', 'value']:
            raise ValueError('"on_selected" must be either "empty", "zero" or "value", got %s' % str(on_selected))
        self.filled_style = filled_style
        self.empty_style = empty_style
        self.empty_value_style = empty_value_style
        self.clear_style = clear_style
        self.error_style = error_style
        self.clear = clear
        self.on_selected = on_selected
        self.display_input = display_input
        self.error_text_format = error_text_format
        self.required_text = required_text
        self.errors = None
        self.submit_button = submit_button

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        widget_context = context['widget']
        final_attrs = widget_context['attrs']
        id_ = final_attrs.get('id')
        if ('min' not in final_attrs) or (final_attrs['min'] is None):
            final_attrs['min'] = 1
        if ('max' not in final_attrs) or (final_attrs['max'] is None):
            num_stars = getattr(settings, 'NUM_STARS', 5)
            final_attrs['max'] = num_stars
        stars = []
        for i in range(final_attrs['max']):
            stars.append('%s_star_%d' % (id_, i))
        if not self.display_input:
            final_attrs['hidden'] = ''
        widget_context['stars'] = stars
        widget_context['filled_style'] = self.filled_style
        widget_context['empty_style'] = self.empty_style
        widget_context['empty_value_style'] = self.empty_value_style
        widget_context['clear_style'] = self.clear_style
        widget_context['error_style'] = self.error_style
        widget_context['clear'] = self.clear
        is_required = widget_context.get('required', True)
        widget_context['render_clear'] = (self.clear == 'always' or (self.clear == 'if-not-required' and not is_required))
        widget_context['clear_id'] = '%s_clear_id' % id_
        widget_context['err_id'] = '%s_err_id' % id_
        widget_context['on_selected'] = self.on_selected
        widget_context['display_input'] = self.display_input
        widget_context['error_text_format'] = self.error_text_format
        widget_context['required_text'] = self.required_text
        widget_context['errors'] = self.errors
        widget_context['submit_button'] = self.submit_button
        return context

    class Media:
        js = ('starwidget/starwidget.js',)
