# number-no-trailing-zeros

Disallow trailing zeros in numbers.

```css
a { top: 0.5000px; bottom: 1.0px; }
/**         ↑                ↑
 *        These trailing zeros */
```

The [`fix` option](https://stylelint.io/user-guide/options#fix) can automatically fix some of the problems reported by this rule.

## Options

### `true`

The following patterns are considered problems:

```css
a { top: 1.0px }
```

```css
a { top: 1.01000px }
```

The following patterns are _not_ considered problems:

```css
a { top: 1px }
```

```css
a { top: 1.01px }
```
