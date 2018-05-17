# TenFour
## Theme

---

#### Theme Colors
The [variables.scss](/src/theme/variables.scss) defines global color codes, as well as potential overrides for platform specific styling. For example:

```
$colors: (
  primary:    #5BAB60,
  secondary:  #EECC50,
  danger:     #A74B4B,
  light:      #EFEFEB,
  dark:       #E6E6DD,
  info:       #888888,
  waiting:    #CCCCCC,
  navbar:     #F5F5F1,
  background: #EFEFEB,
  text:       #8F8F8F,
  grey:       #888888,
  white:      #FFFFFF,
  black:      #000000
);
```

Visit [Theming your Ionic App](https://ionicframework.com/docs/theming/theming-your-app/) for more information on custom color codes.

---

#### Application Styling
The [app.scss](/src/app/app.scss) define application wide styling. For example, to round the organization logo in navbar:
```
ion-toolbar {
  button {
    img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      -webkit-border-radius: 50%;
    }
  }
}
```

Visit [Overriding Ionic Sass Variables](https://ionicframework.com/docs/theming/overriding-ionic-variables/) for information on how to override platform specific styling.

---

#### Page Styling
Each individual page provides ability to override or add custom styling. Visit [PAGES.md](/docs/PAGES.md) for entire hierarchy structure of pages.
