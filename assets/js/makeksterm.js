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


        // whether or not we are still initializing
        let isearly = true
        let write = text => {
            text = $.terminal.escape_brackets(text)
            term.echo(text)
        }
        // Create a terminal from the jQuery terminal plugin
        let term = $('#' + id).terminal(function (cmd, term) {


            if (!term.has_init) {
                term.has_init = true

                // Add callbacks to write IO
                ks._write_stdout.push(text => write(text))
                ks._write_stderr.push(text => write(text))
            }
            // Get a hash of the IO objects so we can tell if something has been printed
            let hash = ks.iohash()
            let this_ct = ct
            window.T = term
            
            //cmd = term.get_command()
            //console.log("CMD", cmd)
            
            // Now, evaluate the command
            let res = ks.eval(cmd, "<inter-" + ct + ">", locals)

            if (res) {
                if (!isearly && ks.iohash() == hash) {
                    // Nothing has been printed in the mean time, so print the result
                    let r = ks.get_repr(res)
                    write(r)
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

        // disable formatting
        //$.terminal.defaults.formatters = []
        $.terminal.defaults.formatters.unshift([/(^|[^\x08]|\r\n)\x08/g, '', true]);

        write("")
        write("### kscript web terminal")
        write("#")
        write("# overall, similar to Python syntax, except:")
        write("#   * no relevant whitespace (use 'if x {...}')")
        write("#   * different naming scheme (true, false, inf, nan)")
        write("#   * use 'obj.__attr' for list of all attributes")
        write("#")
        write("# things to try:")
        write("#   * '2**100'")
        write("#   * 'm.isprime(2**7 - 1)'")
        write("#   * 'm.zeta(2)'")
        write("#   * 'nx.fft.fft([[1, 2], [3, 4]])'")
        write("#")
        write("# quick links:")
        write("#   * https://docs.kscript.org/#Syntax")
        write("#   * https://docs.kscript.org/#Functions")
        write("#   * https://docs.kscript.org/#Modules")
        write("#")
        write("# author: Cade Brown https://cade.site/about")
        write("#")
        write("###")
        write("")

        term.exec("import m")
        term.exec("import nx")
        term.exec("import os")
        term.exec("import util")

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

        isearly = false

        // Return the terminal object
        return term
    })
}

