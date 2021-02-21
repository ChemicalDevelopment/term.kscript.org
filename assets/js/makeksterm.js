/* makeksterm.js - JavaScript file which defines the 'makeksterm()' function
 *
 * Allows to make arbitrary kscript terminals. Assumes you have already included jQuery and
 *   jQuery terminal plugin
 *
 * @author: Cade Brown <cade@kscript.org>
 */

var ks = null;

/* Creates a kscript terminal from the document element 'id'
 */
function makeksterm(id) {
    libks().then(function(_ks) {
        ks = _ks
        ks.init()

        // Create a locals array
        let locals = ks.make_dict()
        let ct = 0
        // Create a terminal from the jQuery terminal plugin
        let term = $('#' + id).terminal(function (cmd, term) {
            if (!term.has_init) {
                term.has_init = true

                // Add callbacks to write IO
                ks._write_stdout.push(text => term.echo(text))
                ks._write_stderr.push(text => term.echo(text))
            }
            // Get a hash of the IO objects so we can tell if something has been printed
            let hash = ks.iohash()
            let this_ct = ct
            
            // Now, evaluate the command
            let res = ks.eval(cmd, "<inter-" + ct + ">", locals)

            if (res) {
                if (ks.iohash() == hash) {
                    // Nothing has been printed in the mean time, so print the result
                    term.echo(ks.get_repr(res))
                }
                ks.decref(res)
            } else {
                // Alert the user that there was an error
                term.echo("[[b;red;]ERROR] (see console)")
            }

            ct++
        }, {
            name: 'kscript',
            greetings: ks.verstr,
            prompt: ">>> ",
        })


        // Now, execute the lines in the URL, if there were any
        var a = location.href;
        var qi = a.indexOf("?");
        if (qi > 0) {
        var qt = decodeURIComponent(a.substring(qi+1))
        var qtl = qt.split(/\n|\\\\/)
        for (var i in qtl) {
            var line = qtl[i]
            term.exec(line)
        }
        }

        // Return the terminal object
        return term
    })
}

