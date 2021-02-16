# Random person extension for Numbas

A [Numbas](http://www.numbas.org.uk) extension providing a collection of functions to generate random people, for use in word problems.

**Demo: https://numbas.mathcentre.ac.uk/question/23094/the-random-person-extension/**

It doesn't really matter what people are called in word problems, but it can have a bad effect on students' perceptions of the world if the plumber's always called Gary and the nurse is always called Julie.

An easy fix is to flip a coin each time you need a name, and choose a male name if it's heads, and a female name if it's tails.

But names come with much more baggage than gender! Social class, age and cultural heritage are just a few of the things you can have a stab at guessing based on someone's name.

So, this extension makes it really easy to randomly pick a name for a representative citizen of England and Wales born between 1996 and 2015, using the ONS's dataset of baby name frequencies in England and Wales, 1996 to 2015.

Names which were given to more than 100 each of males and females are classed as gender-neutral.
Additionally, when picking names without specifiying a gender, occasionally a name that would be returned as "male" or "female" is instead returned as "neutral", representing a person who identified as non-binary.
The proportion of the time that this happens is controlled by the JavaScript variable `Numbas.extensions.random_person.PROB_NONBINARY`, which is 1/100 by default.

## Providing your own name data

The extension contains some built-in JavaScript objects with the data for name frequencies, and pronouns associated with each gender.
You can replace these objects with your own data.

There are some other datasets in `Numbas.extensions.random_person.datasets`.

To switch to another dataset, put something like this in your question's Javascript preamble:

```
var random_person = Numbas.extensions.random_person;
random_person.data = random_person.datasets.fr;
```

The name frequencies are stored in an object at `Numbas.extensions.random_person.data`.

This object has the form:

```
{
    "names": { gender: list of objects {"name": string, "count": integer} },
    "totals": { gender: integer }
}
```

(`gender` stands for a key representing each gender. In the built-in data set, these are `"male"`, `"female"` and `"neutral"`.)

There is also an object giving pronouns for each gender, stored at `Numbas.extensions.random_person.pronouns`.

This object has the form:

```
{ gender: pronoun_map }
```

The built-in `pronoun_map` is an object mapping each of the strings `"they"`, `"their"`, `"theirs"`, `"them"`, `"themself"` to the corresponding pronouns for that gender.
Each of these keys is added to the object returned for a randomly-generated person, so if you are using a language other than English, you could provide a different set of keys.

## Ways this can be improved

* Apart from names, what else should be randomised? Jobs?
* Gender's a complicated topic, so I'm very open to suggestions for improvements in the way it's handled.
* A function which populates the scope with variables for the pronouns, and verb conjugation, so you don't have to set them up yourself in each question. Or maybe functions like `they(person)`, equivalent to `person['pronouns']['they']`.

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

## How to use this

Generate a random person, or people, using the JME functions described below.. Each time you need to use their name, or a pronoun referring to them, use the corresponding entry from their dictionary, as described above.

Here's an example:

```
{person['name']} puts {person['pronouns']['their']} things where {person['pronouns']['they']} like{if(person['gender']='neutral','','s')}.

When people show things to {person['pronouns']['them']}, {person['pronouns']['they']} want{if(person['gender']='neutral','','s')} them for {person['pronouns']['themself']}.
```

The singular "they" is used for gender-neutral people. Don't forget that verb conjugation is different for singular "they": for example, "Charlie likes to read while they walk" compared to "Charlie likes to read while he walks".

If you've only got one person, it can be more convenient to set variables for 'they', 'their', etc. and for verb conjugation, so you don't have to type `person['pronouns']['their']` each time.

Here's that example again:

```
{name} put{s} {their} things where {they} like{s}.

When people show things to {them}, {they} want{s} them for {themself}.
```

If you need more than one person, use `random_people` to ensure that you don't have any repeated names, which could lead to confusion.

## JME functions

### `random_person()`

A person with random name and gender.

### `random_person_with_gender(gender)`

A person with random name and the given gender.

### `random_people(n)`

`n` unique people with random names and genders. If you need more than one person in your question, use this to make sure that no names are repeated.

### `random_people_with_gender(gender,n)`

`n` unique people with random names and the given gender.

### `random_person_with_initial(letter)`

A person with random name and gender, whose name starts with the given letter.

### `random_people_with_different_initials(n)`

`n` unique people with random names, whose names each start with distinct letters.
