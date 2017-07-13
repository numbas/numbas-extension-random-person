(function() {

function go() {
Numbas.addExtension('random_person',['math'], function(extension) {

    var pronouns = {
        "male": {'they': 'he', 'their': 'his', 'theirs': 'his', 'them': 'him', 'themself': 'himself'},
        "female": {'they': 'she', 'their': 'her', 'theirs': 'hers', 'them': 'her', 'themself': 'herself'},
        "neutral": {'they': 'they', 'their': 'their', 'theirs': 'theirs', 'them': 'them', 'themself': 'themself'}
    }

    var math = Numbas.math;

    /** A weighted random partition of n into the categories described by `totals`, which is a dictionary mapping keys to weights
     */
    var weighted_partition_into_k = extension.weighted_partition_into_k = function(n,totals) {
        var a = [];
        var ta = 0;
        var keys = [];
        for(var key in totals) {
            var x = Math.random()*totals[key];
            ta += x;
            a.push(x);
            keys.push(key);
        }
        var k = a.length;
        var tf = 0;
        a = a.map(function(x){ x = Math.round(n*x/ta); tf += x; return x; });
        var diff = Math.abs(tf - n);
        var d = tf>n ? -1 : 1;
        for(var j=0;j<diff;j++) {
            i = -1;
            while(i==-1 || a[i]==0) {
                var i = math.randomint(k);
            }
            a[i] += d;
        }
        var out = {};
        for(var i=0;i<k;i++) {
            out[keys[i]] = a[i];
        }
        return out;
    }

    /** A random partition of n into k piles.
     */
    var partition_into_k = extension.partition_into_k = function(n,k) {
        var a = [];
        var ta = 0;
        for(var i=0;i<k;i++) {
            var x = Math.random();
            ta += x;
            a.push(x);
        }
        var tf = 0;
        a = a.map(function(x){ x = Math.round(n*x/ta); tf += x; return x; });
        var diff = Math.abs(tf - n);
        var d = tf>n ? -1 : 1;
        for(var j=0;j<diff;j++) {
            i = -1;
            while(i==-1 || a[i]==0) {
                var i = math.randomint(k);
            }
            a[i] += d;
        }
        return a;
    }

    /** Choose a key at random from a dictionary mapping keys to weights
     */
    function weighted_choose(options) {
        var total = 0;
        for(var x in options) {
            total += options[x];
        }
        var r = math.randomint(total);
        var t = 0;
        for(var x in options) {
            t += options[x];
            if(t>=r) {
                return x;
            }
        }
    }

    /** Pick a subset of n items from set, which is a list of items with a `count` property.
     * The total is passed in as a parameter to save calculating it each time the function is called.
     */
    function weighted_random_subset(set,total,n) {
        var out = [];
        var seen = {};
        for(var i=0;i<n;i++) {
            var r = Math.floor(total*(Math.random()%1));
            var t = 0;
            for(var j=0;j<set.length;j++) {
                if(!seen[j]) {
                    t += set[j].count;
                    if(set[j].count>0 && t>=r) {
                        break;
                    }
                }
            }
            out.push(set[j]);
            seen[j] = true;
            total -= set[j].count;
        }
        return out;
    }


    var choose = Numbas.math.choose;
    var genders = Object.keys(data.names);

    /** A dictionary of information about a name to be used in a question
     */
    function name_info(name_data,gender) {
        return {gender: gender, name: name_data.name, pronouns: pronouns[gender]};
    }

    /** Choose a random person with the given gender.
     */
    var random_person_with_gender = extension.random_person_with_gender = function(gender) {
        if(!data.names[gender]) {
            throw(new Error("No data for the gender '"+gender+'"'));
        }
        var t = 0;
        var i = math.randomint(data.totals[gender]);
        var names = data.names[gender];
        var num = names.length;
        for(var j=0;j<num;j++) {
            t += names[j].count;
            if(t>=i) {
                return name_info(names[j],gender);
            }
        }
    }

    /* Choose a random name and return it along with gender and pronouns. 
     * Gender is chosen uniformly at random from the options available in the data
     * Returns a dictionary {gender:, name:, pronouns:}, where `pronouns` is a dictionary with keys 'they', 'their' and 'theirs'.
     */
    var random_person = extension.random_person = function() {
        var gender = weighted_choose(data.totals);
        return random_person_with_gender(gender);
    }

    /** Choose n random unique people
     */
    var random_people = extension.random_people = function(n) {
        var counts = weighted_partition_into_k(n,data.totals);
        var out = [];
        genders.forEach(function(gender) {
            out = out.concat(random_people_with_gender(gender,counts[gender]));
        });
        return math.shuffle(out);
    }

    /** Choose n random people with the given gender.
     */
    var random_people_with_gender = extension.random_people_with_gender = function(gender,n) {
        if(!data.names[gender]) {
            throw(new Error("No data for the gender '"+gender+'"'));
        }
        return weighted_random_subset(data.names[gender],data.totals[gender], n).map(function(x){return name_info(x,gender)});
    }

	var types = Numbas.jme.types;
	var funcObj = Numbas.jme.funcObj;
    var TString = types.TString;
    var TNum = types.TNum;
	var TList = types.TList;
    var TDict = types.TDict;

    /** random_person() returns a dictionary representing a person with random name and gender.
     * See name_info for the format of the dictionary
     */
    extension.scope.addFunction(new funcObj('random_person',[],TDict, function() {
        return random_person();
    }, {unwrapValues: true}));

    /** random_person_with_gender(gender) returns a dictionary representing a person with random name and the given gender.
     * See name_info for the format of the dictionary
     */
    extension.scope.addFunction(new funcObj('random_person_with_gender',[TString],TDict, function(gender) {
        return random_person_with_gender(gender);
    }, {unwrapValues: true}));

    /** random_people(n) returns n unique people with random names and genders.
     */
    extension.scope.addFunction(new funcObj('random_people',[TNum],TList, function(n) {
        return random_people(n);
    }, {unwrapValues: true}));

    /** random_people_with_gender(gender,n) returns n unique people with random names and the given gender.
     */
    extension.scope.addFunction(new funcObj('random_people_with_gender',[TString,TNum],TList, function(gender,n) {
        return random_people_with_gender(gender,n);
    }, {unwrapValues: true}));
});
}
/** Frequencies of names of babies born in England and Wales between 1996 and 2015, from the ONS.
 *  © Crown Copyright, reproduced under the Open Government Licence - http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
 */
var data = 
go();
})();