> **Important** - I'm not a medical professional, therefore I only have limited knowledge about APBD. I'm just tryna help :)

# APBD Food List

Lists of foods sorted by glycemic indices, glycemic loads, sugar & carbs.

## Goal

Providing a list, from which people with APBD can eat/cook while being sure the food they're eating doesnt harm them unnecessarily.

The aim for the food list itself, is to contain most if not all of the simple fruits & vegetables, and even have data about specific products from specific companies.

## Contribute

This website is open source - pull requests are welcome, and credits should be given to contributors on the main/about web page (this isn't decided yet).

On the website itself there are also contribution forms, intended to steamline the contribution process, expand the list, and in-turn make the website more useful.

While I am aware this is abusable, I'm willing to endure abuse of this feature, Since the benefits greatly outwheigh the risks (benefit: expansion of the website, risk: potentially needing to fight off spam on the development end)

## APBD: Theoretical Background

When blood sugar is high, the body tries to produce glycogen, which is used to store the sugar for later use.

One of the steps to produce glycogen is called **branching**, in which series of glucose molecules are capped, and other series of glucosed can be attached to that cap, giving glycogen a tree-like structure.

In APBD, the branching enzyme, called GBE-1, may be mutated[^1]. This can cause a lack of produced glycogen branching enzymes, which is used in the step mentioned above.

A lack of glycogen branching enzymes leads to attempted productions of glycogen producing a sturcture called a "polyglucosan body". These bodies accumulate in cells, and damage them.

Simple carbohydrates are digested quickly, causing a quick & fast release of glucose in the blood, triggering an attempt at producing glycogen, which may cause "problematic glycogen" to be produced, harming the body.

Complex carbohydrates are digested slowly, causing a more gradual release of glucose in the blood. Less excess glucose at a given point in the blood means it is less likely for the body to produce glycogen, which in this case, should reduce production of problematic glycogen, harming the body less.

---

Therefore, I assume that less blood glucose spikes ar good, and we can expect these spikes from foods with a high glycemic load.

Glycemic load is calculated by multiplying a foods glycemic index, converted from 0 to 100 percentage to a 0 to 1 range, multiplied by the amount of carbs the food contains if the food weighs `grams`:
$$Load_{grams} = \frac{index}{100} \cdot FoodCarbs(grams)$$


## Liability

As stated above, im not a medical professional - just a developer trying to aid, by making helpful data for people with APBD more accessible.

This website is under the [GPL 2.0 license](https://github.com/ShaharMS/APBD-FoodList/blob/main/LICENSE.md).



[^1]: [Source - APBD on wikipedia](https://en.wikipedia.org/wiki/Adult_polyglucosan_body_disease#Mechanism) - Seems like APBD may not be caused by GBE-1 mutations, in which case the cause is unknown.
