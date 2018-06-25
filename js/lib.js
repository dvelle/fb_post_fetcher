
var json_contents = [];

$(document).ready(function () {


    function fetch_page(ac_token, pg_name) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/' + pg_name, {
            access_token: ac_token
        }, function (response) {
            if (response.hasOwnProperty('name')) {
                finish_loading('statusGreen');
                $('#pg_status').html('<i class="glyphicon glyphicon-ok" style="color:green"></i>');
                $('#pg_status').append('<br>' + response.name + '<br>Page Found!');
                $('#pg_status').removeClass('alert alert-danger');
                $('#pg_status').addClass('alert alert-success');
                $('#view_posts').removeAttr('disabled');
                $('#view_posts').removeClass('disabled');
                $('#download_posts').removeAttr('disabled');
                $('#download_posts').removeClass('disabled');

            }
            else {
                finish_loading('statusRed');
                $('#pg_status').html('<i class="glyphicon glyphicon-remove" style="color:red"></i>');
                $('#pg_status').append('<br>' + response.error.message + response.error.type);
                $('#pg_status').removeClass('alert alert-success');
                $('#pg_status').addClass('alert alert-danger');
                $('#view_posts').attr('disabled', true);
                $('#view_posts').addClass('disabled');
                $('#download_posts').attr('disabled', true);
                $('#download_posts').addClass('disabled');
            }
            console.log((response.error));
        });

    }

    $('#btn-set-pg').on('click', function () {
        let ac_token = $('#txt_ac_token').val();
        let pg_name = $('#txt_pg_name').val();
        window.localStorage.ac_token = ac_token;
        window.localStorage.pg_name = pg_name;
        fetch_page(ac_token, pg_name);
        start_loading();
    });
    $('#nextBtn').on('click', function () {
        let pg_name = $('#txt_pg_name').val();
        if (!(pg_name === "")) {
            let ac_token = $('#txt_ac_token').val();
            window.localStorage.ac_token = ac_token;
            window.localStorage.pg_name = pg_name;
            fetch_page(ac_token, pg_name);
        }

    });

    $('#view_posts').on('click', function () {
        const BrowserWindow = require('electron').remote.BrowserWindow
        const path = require('path')

        const modalPath = path.join('file://', __dirname, './view.html')
        let win2 = new BrowserWindow({ frame: false })
        win2.on('close', function () { win = null })
        win2.loadURL(modalPath)
        win2.show()
    });

    $('#transfer-pa').on('click', function () {
        $('#page-attributes  > option:selected').each(function () {
            $(this).remove();
            $('#page-attributes-selected').append('<option value="' + $(this).val() + '" selected>' + $(this).text() + '</option>');
        });
    });
    $('#transfer-po').on('click', function () {
        $('#post-attributes  > option:selected').each(function () {
            $(this).remove();
            $('#post-attributes-selected').append('<option value="' + $(this).val() + '" selected>' + $(this).text() + '</option>');
        });
    });

    $('#transfer-po-back').on('click', function () {
        $('#post-attributes-selected  > option:selected').each(function () {
            $(this).remove();
            $('#post-attributes').append('<option value="' + $(this).val() + '" selected>' + $(this).text() + '</option>');
        });
    });
    $('#transfer-pa-back').on('click', function () {
        $('#page-attributes-selected  > option:selected').each(function () {
            $(this).remove();
            $('#page-attributes').append('<option value="' + $(this).val() + '" selected>' + $(this).text() + '</option>');
        });
    });


    $('#download_json').on('click', function () {

        if (is_valid('no_posts')) {


            let page_attr = $('#page-attributes-selected').val();
            let post_attr = $('#post-attributes-selected').val();
            for (let index = 0; index < page_attr.length; index++) {
                page_attr[index] = page_attr[index].replace('pa-', '');
            }
            for (let index = 0; index < post_attr.length; index++) {
                post_attr[index] = post_attr[index].replace('po-', '');
                switch (post_attr[index]) {
                    case 'comments':
                        post_attr[index] = "comments.limit(10000){message,reactions.type(LIKE).limit(0).summary(total_count).as(comm_LIKES),reactions.type(LOVE).limit(0).summary(total_count).as(comm_LOVES),reactions.type(HAHA).limit(0).summary(total_count).as(comm_HAHA),reactions.type(SAD).limit(0).summary(total_count).as(comm_SAD),reactions.type(ANGRY).limit(0).summary(total_count).as(comm_ANGRY)}"
                        enable_comments = true;
                        break;

                    case 'reactions':
                        post_attr[index] = "reactions.type(LIKE).limit(0).summary(total_count).as(LIKES),reactions.type(LOVE).limit(0).summary(total_count).as(LOVES),reactions.type(HAHA).limit(0).summary(total_count).as(HAHAS),reactions.type(SAD).limit(0).summary(total_count).as(SADS),reactions.type(ANGRY).limit(0).summary(total_count).as(ANGRYS)"
                        break;

                    case 'shares':
                        post_attr[index] = "shares.summary(total_count)"
                        break;

                    case 'message':
                        enable_post = true;
                        break;
                }
            }

            if (post_attr.length == 0) {
                alert('Please select a post attribute');
            }
            let pg_name = window.localStorage.pg_name;
            let ac_token = window.localStorage.ac_token;

            if (page_attr.length > 0) {

                start_loading();
                FB.api('/' + pg_name, {
                    access_token: ac_token,
                    fields: page_attr
                }, function (response) {
                    if (response.hasOwnProperty('error')) {
                        finish_loading();
                        alert(response.error);
                    } else {
                        console.log(response);
                        json_contents = json_contents.concat(JSON.stringify(response));

                    }
                });
            }
            if (post_attr.length > 0) {

                FB.api('/' + pg_name + '/posts', {
                    access_token: ac_token,
                    fields: post_attr,
                    limit: 1
                }, function (response) {
                    console.log(JSON.stringify(response));
                    if (response.hasOwnProperty('error')) {
                        alert(response.error);
                    } else {
                        json_contents = json_contents.concat(JSON.stringify(response));
                        if (response.hasOwnProperty('paging')) {
                            let paging = response.paging;
                            next_url = paging.next;
                            let no_posts = $('#no_posts').val();
                            update_loading(1, no_posts);
                            get_posts(next_url, 2, no_posts);
                        }
                    }
                });

            }

        }
        else {
            alert('All fields are compulsary!');
        }

    });
    $('#download_page_posts').on('click', function () {
        path = invoke_save_posts()
        start_loading();
    });

    $('#download_comments').on('click', function () {
        path = invoke_save_comments();
        start_loading();
    });

    function get_independent_posts(url, counter, no_posts, path) {

        if (counter <= no_posts) {
            let pg_name = window.localStorage.pg_name;
            let ac_token = window.localStorage.ac_token;

            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", url, true);
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    update_loading(counter,no_posts);
                    var response = xhttp.responseText;
                    response = JSON.parse(response);
                    let postdata = response.data[0].message;
                    save_post(path, postdata, counter);
                    let paging = response.paging;
                    next_url = paging.next;
                    get_independent_posts(next_url, counter + 1, no_posts, path);
                }
            };
            xhttp.send();
        }

    }
    function get_posts(url, counter, no_posts) {

        if (counter <= no_posts) {
            let pg_name = window.localStorage.pg_name;
            let ac_token = window.localStorage.ac_token;

            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", url, true);
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    update_loading(counter, no_posts);
                    var response = xhttp.responseText;
                    json_contents = json_contents.concat(response);
                    response = JSON.parse(response);
                    let paging = response.paging;
                    next_url = paging.next;
                    get_posts(next_url, counter + 1, no_posts);
                }
            };
            xhttp.send();
        }
        else {
            save_json();
        }


    }

    function invoke_save_comments() {
        const ipc = require('electron').ipcRenderer
        ipc.send('save-dialog')
        ipc.on('saved-file', function (event, path) {

            if (is_valid('no_posts')) {
                let pg_name = window.localStorage.pg_name;
                let ac_token = window.localStorage.ac_token;
                let post_attr = $('#post-attributes-selected').val();

                if (post_attr.length > 0) {

                    FB.api('/' + pg_name + '/posts', {
                        access_token: ac_token,
                        fields: 'comments.limit(1000),message',
                        limit: 1
                    }, function (response) {
                        if (response.hasOwnProperty('error')) {
                            alert(response.error);
                        } else {

                            let comm_data = response.data[0].message;
                            let comments = response.data[0].comments.data;
                            console.log(comments);
                            for (let index = 0; index < comments.length; index++) {
                                comm_data += "\n" + comments[index].message;
                            }

                            save_post(path, comm_data, 1);
                            if (response.hasOwnProperty('paging')) {
                                let paging = response.paging;
                                next_url = paging.next;
                                let no_posts = $('#no_posts').val();
                                update_loading(1,no_posts);
                                get_comments(next_url, 2, no_posts, path);
                            }
                        }
                    });

                }

            }
            else {
                alert('All fields are compulsary!');
            }

        });

    }

    function get_comments(url, counter, no_posts, path) {

        if (counter <= no_posts) {
            let pg_name = window.localStorage.pg_name;
            let ac_token = window.localStorage.ac_token;

            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", url, true);
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    update_loading(counter,no_posts);
                    var response = xhttp.responseText;
                    response = JSON.parse(response);
                    let comm_data = response.data[0].message;
                    let comments = response.data[0].comments.data;
                    for (let index = 0; index < comments.length; index++) {
                        comm_data += "\n" + comments[index].message;
                    }
                    save_post(path, comm_data, counter);
                    let paging = response.paging;
                    next_url = paging.next;
                    get_comments(next_url, counter + 1, no_posts, path);
                }
            };
            xhttp.send();
        }

    }

    function invoke_save_posts() {
        const ipc = require('electron').ipcRenderer
        ipc.send('save-dialog')
        ipc.on('saved-file', function (event, path) {

            if (is_valid('no_posts')) {
                let post_attr = $('#post-attributes-selected').val();

                if (post_attr.length == 0) {
                    alert('Please select a post attribute');
                }
                let pg_name = window.localStorage.pg_name;
                let ac_token = window.localStorage.ac_token;

                if (post_attr.length > 0) {

                    FB.api('/' + pg_name + '/posts', {
                        access_token: ac_token,
                        fields: 'message',
                        limit: 1
                    }, function (response) {
                        console.log(JSON.stringify(response));
                        if (response.hasOwnProperty('error')) {
                            alert(response.error);
                        } else {
                            let postdata = response.data[0].message;
                            save_post(path, postdata, 1);
                            if (response.hasOwnProperty('paging')) {
                                let paging = response.paging;
                                next_url = paging.next;
                                let no_posts = $('#no_posts').val();
                                update_loading(1,no_posts);
                                get_independent_posts(next_url, 2, no_posts, path);
                            }
                        }
                    });

                }

            }
            else {
                alert('All fields are compulsary!');
            }

        });
    }
    function save_json() {
        const ipc = require('electron').ipcRenderer
        ipc.send('save-dialog')
        ipc.on('saved-file', function (event, path) {
            path = path.split('.')
            path = path[0] + '.json'
            var fs = require('fs');

            fs.writeFile(path, '[' + json_contents + ']', function (err) {
                if (err) throw err;
                console.log('Saved! File!!!!!!!!!!!!!!!!!!!');
            });
        })
    }
    function save_post(path, contents, no) {

        path = path.split('.')
        path = path[0] + no + '.txt'
        var fs = require('fs');
        fs.writeFile(path, contents, function (err) {
            if (err) throw err;
            console.log('Saved! File!!!!!!!!!!!!!!!!!!!');
        });
    }
    function is_valid(id) {
        return $('#' + id).val() == "" ? false : true
    }
    function enable_btn(id) {
        $('#' + id).removeAttr('disabled');
        $('#' + id).removeClass('disabled');
    }

    function disable_btn(id) {
        $('#' + id).attr('disabled', true);
        $('#' + id).addClass('disabled');
    }


    function start_loading() {
        var $loader = $('#loader');
        var $Bar = $('#progressBar');
        var $text = $('#loader-value');
        $loader.css({
            'display': 'flex',
            'animation': 'dropIn 1200ms ease-in-out forwards'
        });
        $Bar.css('width', '0%');
        $text.html("0%");

    }

    function update_loading(value, maxValue) {
        if (value === maxValue) {
            finish_loading();
        } else {
            var $Bar = $('#progressBar');
            var $text = $('#loader-value');
            var updateVal = parseInt((value / maxValue) * 100);
            $Bar.css('width', updateVal + '%');
            $text.html(updateVal + '%');

        }
    }

    function finish_loading(statusColor) {
        var $loader = $('#loader');
        var $Bar = $('#progressBar');
        var $text = $('#loader-value');
        $Bar.css('width', '100%');
        $text.html("100%");
        $loader.css({
            'animation': 'pullOut 800ms ease-in-out forwards 2000ms',
            'background': statusColor + ' !important'
        });
        setTimeout(function () {
            $loader.css('display', 'none');
            $text.html('0%');
            $Bar.css('width', '0%');
        }, 3000);
    }


});

