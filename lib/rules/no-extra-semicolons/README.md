# no-extra-semicolons

Disallow extra semicolons.

```css
a { color: pink;; }
/**             ↑
 *  This semicolons */
```

This rule ignores semicolons after Less mixins.

The [`fix` option](https://stylelint.io/user-guide/options#fix) can automatically fix all of the problems reported by this rule.

## Options

### `true`

The following patterns are considered problems:

```css
@import "x.css";;
```

```css
@import "x.css";
;
```

```css
a {
  color: pink;;
}
```

```css
a {
  ;color: pink;
}
```

```css
a {
  color: pink;
  ;
}
```

```css
a {
  color: red;
}
;
b {
  color: white;
}
```

The following patterns are _not_ considered problems:

```css
@import "x.css";
```

```css
a {
  color: pink;
}
```
