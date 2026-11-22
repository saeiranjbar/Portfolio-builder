# Template imagery

Every image used by the built-in templates in `lib/templates.ts` comes from
[Picsum Photos](https://picsum.photos/) (`https://picsum.photos/id/<id>/1200/900.jpg`).

## Source and licence

- Picsum serves photographs from [Unsplash](https://unsplash.com/). Those photos are
  published under the [Unsplash License](https://unsplash.com/license): free to use,
  including commercially, with no attribution required.
- Confirm the licence terms still apply before shipping to production; Picsum does
  not publish its own licence, so this relies on the Unsplash source.

## Image IDs used

Only IDs that returned HTTP 200 from picsum.photos (redirects followed) are used:

1005, 1011, 1015, 1016, 1018, 1020, 1024, 1025, 1027, 1035, 1039, 1041,
1043, 1044, 1048, 1050, 1058, 1062, 1074, 1076, 1077, 1081, 1084

## How they are assigned

- The 43 image slots that previously used `/templates/se-1.svg` or were empty
  (`imageUrl` / `secondImageUrl`) are assigned in file order, cycling through the list
  above. The same photo can appear in more than one template, but a template's own
  slots only repeat once it has used all 23 IDs.
- The generic photos do not match the captions. Captions such as "Brand mark on coffee
  bag" describe work the template would show; replace the photo with the real project
  image when a template is customised.

## Not covered

- `public/templates/se-1.svg` through `se-6.svg` are no longer referenced by
  `lib/templates.ts`. They can be deleted once nothing else uses them.
- Re-check the ID list if picsum.photos changes its catalogue.
