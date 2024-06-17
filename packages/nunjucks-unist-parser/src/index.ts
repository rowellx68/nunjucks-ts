import fs from 'node:fs'
import { parse as njkParse } from 'nunjucks/src/parser'
import { lex as njkLex } from 'nunjucks/src/lexer'
import { parse } from './lib/parser'

const btn = `{% from "../../macros/attributes.njk" import nhsukAttributes as attr, sample with context %}

{#- Set classes for this component #}
{%- set classNames = "nhsuk-button" -%}

{%- if params.classes %}
  {% set classNames = classNames + " " + params.classes %}
{% endif %}

{%- if params.isStartButton %}
  {% set classNames = classNames + " nhsuk-button--start" %}
{% endif %}

{#- Determine type of element to use, if not explicitly set #}
{%- if params.element %}
  {% set element = params.element | lower %}
{% else %}
  {% if params.href %}
    {% set element = 'a' %}
  {% else %}
    {% set element = 'button' %}
  {% endif %}
{% endif -%}

{%- macro _startIcon() %}
  {#- The SVG needs 'focusable="false"' so that Internet Explorer does not
  treat it as an interactive element - without this it will be
  'focusable' when using the keyboard to navigate. #}
  <svg class="nhsuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z"/>
  </svg>
{%- endmacro -%}

{#- Define common attributes that we can use across all element types #}

{%- set commonAttributes %} class="{{ classNames }}" data-module="nhsuk-button" {{- nhsukAttributes(params.attributes) -}} {% if params.id %} id="{{ params.id }}"{% endif %}{% endset %}

{#- Define common attributes we can use for both button and input types #}

{%- set buttonAttributes %}{% if params.name %} name="{{ params.name }}"{% endif %}{% if params.disabled %} disabled aria-disabled="true"{% endif %}{% if params.preventDoubleClick !== undefined %} data-prevent-double-click="{{ params.preventDoubleClick }}"{% endif %}{% endset %}

{#- Actually create a button... or a link! #}

{%- if element == 'a' %}
<a href="{{ params.href if params.href else '#' }}" role="button" draggable="false" {{- commonAttributes | safe }}>
  {{ params.html | safe | trim | indent(2) if params.html else params.text }}
  {{- _startIcon() | safe if params.isStartButton }}
</a>

{%- elseif element == 'button' %}
<button {%- if params.value %} value="{{ params.value }}"{% endif %} type="{{ params.type if params.type else 'submit' }}" {{- buttonAttributes | safe }} {{- commonAttributes | safe }}>
  {{ params.html | safe | trim | indent(2) if params.html else params.text }}
  {{- _startIcon() | safe if params.isStartButton }}
</button>

{%- elseif element == 'input' %}
<input value="{{ params.text }}" type="{{ params.type if params.type else 'submit' }}" {{- buttonAttributes | safe }} {{- commonAttributes | safe }}>
{%- endif %}`

let inc = `{% include a + "sample.html" ignore missing %}`

const lexicon = njkLex(inc)

const tokens = []

while (true) {
  const tok = lexicon.nextToken()

  if (!tok) {
    break
  }

  tokens.push(tok)
}

console.log(JSON.stringify(tokens, null, 2))
console.log(JSON.stringify(parse(inc), null, 2))
