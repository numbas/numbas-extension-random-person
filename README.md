# Random person extension for Numbas

A [Numbas](http://www.numbas.org.uk) extension providing a collection of functions to generate random people, for use in word problems.

It doesn't really matter what people are called in word problems, but it can have a bad effect on students' perceptions of the world if the plumber's always called Gary and the nurse is always called Julie.

An easy fix is to flip a coin each time you need a name, and choose a male name if it's heads, and a female name if it's tails.

But names come with much more baggage than gender! Social class, age and cultural heritage are just a few of the things you can have a stab at guessing based on someone's name.

So, this extension makes it really easy to randomly pick a name for a representative citizen of England and Wales born between 1996 and 2015, using the ONS's dataset of baby name frequencies in England and Wales, 1996 to 2015.

Names which were given to more than 100 each of males and females are classed as gender-neutral.

## Ways this can be improved

* The dataset from England and Wales is baked-in to the extension at the moment. It would be good to add an option to provide your own data.
* Apart from names, what else should be randomised? Jobs?
* Gender's a complicated topic, so I'm very open to suggestions for improvements in the way it's handled.
* Other languages!

## Copyright

The name frequency data is Crown Copyright, reproduced under the [Open Government Licence](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

The rest of this package is released under the terms of the Apache License 2.0. See the `LICENSE` file for more information.

## The data structure

The code returns dictionaries representing people, of the form

```
{
    "gender": string, //("male", "female", or "neutral" at the moment)
    "name": string,
    "pronouns": {
        "they": the subjective personal pronoun, e.g. 'he' or 'she',
        "their": the possessive determiner, e.g. 'his' or 'her',
        "theirs": the possessive pronoun, e.g. 'his' or 'hers',
        "them": the objective personal pronoun, e.g. 'him' or 'her',
        "themself": the reflexive pronoun, e.g. 'himself' or 'herself'
    }
}
```

The singular "they" is used for gender-neutral people. Don't forget that verb conjugation is different for singular "they": for example, "Charlie likes to read while they walk" compared to "Charlie likes to read while he walks".

## JME functions

### `random_person()`

A person with random name and gender.

### `random_person_with_gender(gender)`

A person with random name and the given gender.

### `random_people(n)`

`n` unique people with random names and genders. If you need more than one person in your question, use this to make sure that no names are repeated.

### `random_people_with_gender(gender,n)`

`n` unique people with random names and the given gender.