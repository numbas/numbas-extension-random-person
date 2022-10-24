{% raw %}(function () {

function go() {
Numbas.addExtension("random_person", ["math"], function (extension) {
    /** Find count for a key in a counted reduce_prefix_map
     *
     */
    function find_count(map) {
        if (Object.keys(map).length === 0) {
            return map;
        } else {
            return map["#"];
        }
    }

    /**
     *  Find index in counted reduced prefix map
     */
    function find_at_index(map, i, state = "") {
        var t = 0;
        var keys = Object.keys(map);
        if (keys.length === 0) {
            return state;
        }
        for (key_index in keys) {
            var key = keys[key_index];
            if (key !== "#") {
                t += find_count(map[key]);
            }
            if (t >= i) {
                if (Object.keys(map[key]) === 0) {
                    // Found
                    return state;
                }
                return find_at_index(map[key], t - i, state + key);
            }
        }
    }

    /**
     *  Find counted reduced map from counted reduced map with all names that start with a given initial
     */
    function start_with_initial(map, initial) {
        let new_map = {};
        let count = 0;
        var keys = Object.keys(map);
        if (keys.length === 0) {
            return;
        }
        for (var key_index = 0; key_index < keys.length; key_index++) {
            var key = keys[key_index];
            if (
                key.slice(0, initial.length) ==
                initial.slice(0, key.length)
            ) {
                if (key.length >= initial.length) {
                    new_map[key] = map[key];
                } else {
                    var sub_map = initial.slice(
                        key.length,
                        initial.length
                    );
                    if (find_count(sub_map) > 0) {
                        new_map[key] = start_with_initial(map[key]);
                    }
                }
                count += find_count(new_map[key]);
            }
        }
        new_map["#"] = count;
        return new_map;
    }

    /** Change a reduced prefix map so it becomes a counted reduced prefix map
     * It contains an extra field "#" in each map that has to total number usages of names in the node (including subnodes)
     * The top level contains an "#" field with the total number of occurrences
     */
    function count_reduced_prefix_map(map) {
        var keys = Object.keys(map);
        if (keys.length === 0) {
            return;
        }
        for (var key_index = 0; key_index < keys.length; key_index++) {
            var key = keys[key_index];
            count_reduced_prefix_map(map[key]);
        }
        var count = 0;
        for (var key_index = 0; key_index < keys.length; key_index++) {
            var key = keys[key_index];
            count += find_count(map[key]);
        }
        map["#"] = count;
    }

    for (var x in datasets) {
        datasets[x] = JSON.parse(
            LZString.decompressFromBase64(datasets[x])
        );
        var genders = Object.keys(datasets[x].names);
        for (
            var gender_index = 0;
            gender_index < genders.length;
            gender_index++
        ) {
            var gender = genders[gender_index];
            count_reduced_prefix_map(datasets[x].names[gender]);
        }
    }

    extension.datasets = datasets;
    extension.data = datasets.uk;

    /** Probability that a randomly-generated person whose gender wasn't specified will be nonbinary, and have they/them pronouns.
     */
    extension.PROB_NONBINARY = 1 / 100;

    extension.pronouns = {
        male: {
            they: "he",
            their: "his",
            theirs: "his",
            them: "him",
            themself: "himself",
        },
        female: {
            they: "she",
            their: "her",
            theirs: "hers",
            them: "her",
            themself: "herself",
        },
        neutral: {
            they: "they",
            their: "their",
            theirs: "theirs",
            them: "them",
            themself: "themself",
        },
    };

    var math = Numbas.math;

    /** A weighted random partition of n into the categories described by `totals`, which is a dictionary mapping keys to weights
     */
    var weighted_partition_into_k =
        (extension.weighted_partition_into_k = function (n, totals) {
            var a = [];
            var ta = 0;
            var keys = [];
            for (var key in totals) {
                var x = Math.random() * totals[key];
                ta += x;
                a.push(x);
                keys.push(key);
            }
            var k = a.length;
            var tf = 0;
            a = a.map(function (x) {
                x = Math.round((n * x) / ta);
                tf += x;
                return x;
            });
            var diff = Math.abs(tf - n);
            var d = tf > n ? -1 : 1;
            for (var j = 0; j < diff; j++) {
                i = -1;
                while (i == -1 || a[i] == 0) {
                    var i = math.randomint(k);
                }
                a[i] += d;
            }
            var out = {};
            for (var i = 0; i < k; i++) {
                out[keys[i]] = a[i];
            }
            return out;
        });

    /** Choose a key at random from a dictionary mapping keys to weights
     */
    function weighted_choose(options) {
        var total = 0;
        for (var x in options) {
            total += options[x];
        }
        var r = math.randomint(total);
        var t = 0;
        for (var x in options) {
            t += options[x];
            if (t >= r) {
                return x;
            }
        }
    }

    /** Pick a subset of n items from map, which is a counted reduced prefix map.
     */
    function weighted_random_subset(map, n) {
        var out = [];
        var seen = {};
        var total = map["#"];
        while (out.length < n) {
            var r = Math.floor(total * (Math.random() % 1));
            let name = find_at_index(map, r);
            if (seen.hasOwnProperty(name)) {
                continue;
            }
            out.push(name);
            seen[name] = true;
        }
        return out;
    }

    var choose = Numbas.math.choose;

    /** A dictionary of information about a name to be used in a question
     */
    function name_info(name, gender) {
        return {
            gender: gender,
            name: name,
            pronouns: extension.pronouns[gender],
        };
    }

    /** Choose a random person with the given gender.
     */
    var random_person_with_gender =
        (extension.random_person_with_gender = function (gender, data) {
            data = data || extension.data;
            if (!data.names[gender]) {
                throw new Error(
                    "No data for the gender '" + gender + '"'
                );
            }
            var t = 0;
            var names = data.names[gender];
            var i = math.randomint(find_count(names));
            var name = find_at_index(names, i);
            return name_info(name, gender);
        });

    function maybe_nonbinary(person, data) {
        if (
            data.totals["neutral"] > 0 &&
            Math.random() < extension.PROB_NONBINARY
        ) {
            person = name_info(person.name, "neutral");
        }
        return person;
    }

    /* Choose a random name and return it along with gender and pronouns.
     * Gender is chosen uniformly at random from the options available in the data
     * Returns a dictionary {gender:, name:, pronouns:}, where `pronouns` is a dictionary with keys 'they', 'their' and 'theirs'.
     */
    var random_person = (extension.random_person = function (data) {
        data = data || extension.data;
        var gender = weighted_choose(data.totals);
        return maybe_nonbinary(
            random_person_with_gender(gender, data),
            data
        );
    });

    /** Choose n random unique people
     */
    var random_people = (extension.random_people = function (n, data) {
        data = data || extension.data;
        var counts = weighted_partition_into_k(n, data.totals);
        var out = [];
        Object.keys(data.names).forEach(function (gender) {
            out = out.concat(
                random_people_with_gender(
                    gender,
                    counts[gender],
                    data
                ).map(function (p) {
                    return maybe_nonbinary(p, data);
                })
            );
        });
        return math.shuffle(out);
    });

    /** Choose n random people with the given gender.
     */
    var random_people_with_gender =
        (extension.random_people_with_gender = function (
            gender,
            n,
            data
        ) {
            data = data || extension.data;
            if (!data.names[gender]) {
                throw new Error(
                    "No data for the gender '" + gender + '"'
                );
            }
            return weighted_random_subset(data.names[gender], n).map(
                function (x) {
                    return name_info(x, gender);
                }
            );
        });

    /** Choose a random person whose name begins with the given letter.
     */
    var random_person_with_initial =
        (extension.random_person_with_initial = function (
            initial,
            data
        ) {
            data = data || extension.data;
            var names = {};
            var totals = {};
            Object.keys(data.names).forEach(function (gender) {
                let map = start_with_initial(
                    data.names[gender],
                    initial
                );
                names[gender] = map;
                totals[gender] = find_count(map);
            });
            var idata = { names: names, totals: totals };

            return random_person(idata);
        });

    /** Choose n random people whose names each start with distinct letters.
     */
    var random_people_with_different_initials =
        (extension.random_people_with_different_initials = function (
            n,
            data
        ) {
            data = data || extension.data;
            if (n < 1) {
                return [];
            }

            var people = [];
            var possible_initials = math.shuffle(
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
            );
            while (people.length < n && possible_initials.length > 0) {
                let initial = possible_initials.pop();
                let person = random_person_with_initial(initial);
                people.push(person);
            }
            if (people.length < n) {
                throw new Error(
                    "There are only " +
                        people.length +
                        " distinct initials."
                );
            }
            return people;
        });

    var types = Numbas.jme.types;
    var funcObj = Numbas.jme.funcObj;
    var TString = types.TString;
    var TNum = types.TNum;
    var TList = types.TList;
    var TDict = types.TDict;

    /** random_person() returns a dictionary representing a person with random name and gender.
     * See name_info for the format of the dictionary
     */
    extension.scope.addFunction(
        new funcObj(
            "random_person",
            [],
            TDict,
            function () {
                return random_person();
            },
            { unwrapValues: true }
        )
    );

    /** random_person_with_gender(gender) returns a dictionary representing a person with random name and the given gender.
     * See name_info for the format of the dictionary
     */
    extension.scope.addFunction(
        new funcObj(
            "random_person_with_gender",
            [TString],
            TDict,
            function (gender) {
                return random_person_with_gender(gender);
            },
            { unwrapValues: true }
        )
    );

    /** random_people(n) returns n unique people with random names and genders.
     */
    extension.scope.addFunction(
        new funcObj(
            "random_people",
            [TNum],
            TList,
            function (n) {
                return random_people(n);
            },
            { unwrapValues: true }
        )
    );

    /** random_people_with_gender(gender,n) returns n unique people with random names and the given gender.
     */
    extension.scope.addFunction(
        new funcObj(
            "random_people_with_gender",
            [TString, TNum],
            TList,
            function (gender, n) {
                return random_people_with_gender(gender, n);
            },
            { unwrapValues: true }
        )
    );

    /** random_person_with_initial(initial) returns a person with random gender and a name starting with the given letter.
     */
    extension.scope.addFunction(
        new funcObj(
            "random_person_with_initial",
            [TString],
            TDict,
            function (initial) {
                return random_person_with_initial(initial);
            },
            { unwrapValues: true }
        )
    );

    /** random_people_with_different_initials(n) returns n unique people with random names that each start with different letters.
     */
    extension.scope.addFunction(
        new funcObj(
            "random_people_with_different_initials",
            [TNum],
            TList,
            function (n) {
                return random_people_with_different_initials(n);
            },
            { unwrapValues: true }
        )
    );
});
}

    // Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
    // This work is free. You can redistribute it and/or modify it
    // under the terms of the WTFPL, Version 2
    // For more information see LICENSE.txt or http://www.wtfpl.net/
    //
    // For more information, the home page:
    // http://pieroxy.net/blog/pages/lz-string/testing.html
    //
    // LZ-based compression algorithm, version 1.4.4
    // prettier-ignore
    var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);
    /**
     * Datasets containing data for a few countries.
     *
     * "uk":
     *
     * Frequencies of names of babies born in England and Wales between 1996 and 2015, from the ONS.
     * Names occurring more than 100 times under both "female" and "male" are also listed in "neutral", with frequency scaled down.
     *  © Crown Copyright, reproduced under the Open Government Licence - http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
     *
     *  "us":
     *
     *  Frequencies of names of babies born in the USA between 2003 and 2019.
     *  There are no "neutral" names.
     *  Downloaded from https://www.ssa.gov/oact/babynames/limits.html
     *
     *  "fr":
     *
     *  Frequencies of names of babies born in France (excluding Mayotte) between 2003 and 2019.
     *  Names were in all capitals in the source data: they've been converted to lower-case, except for the first letter.
     *  There are no "neutral" names.
     *  Downloaded from https://www.insee.fr/fr/statistiques/2540004?sommaire=4767262
     */
    // prettier-ignore
    {% endraw %}var datasets = {{datasets}};{% raw %}


go();
})();{% endraw %}
