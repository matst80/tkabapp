

String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};

String.prototype.short = function () {
    return this.replace(/Centralstation/ig, 'C');
};

Date.prototype.inmin = function () {
    return this.getHours() * 60 + this.getMinutes();
};

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
};
/*
setTimeout(function() {
    $('input.x, .travelerrow input').each(function () {
        var i = $(this);
        var x = $('<div class="inpx">x</div>').appendTo(i);
        x.click(function () {
            i.val('').change();
        });
    });
}, 1000);
*/

Number.prototype.timeSpan = function () {
    var hours = Math.floor(this / 60);
    var minutes = this % 60;
    if (minutes < 10 && hours > 0)
        minutes = '0' + minutes;
    if (hours > 0)
        return hours + ':' + minutes;
    return minutes + 'm';
};

var svcUrl = 'http://tkab.wd7dev.se/tripfinder.asmx/',
    windowwidth = $(window).width(),
    windowheight = $(window).height();

$('.sitebtn').click(function () {
    $(this).toggleClass('active');
    $('#togglefoot').toggleClass('open');
});

$(window).bind('facebookLoaded', function () {

    FB.init({
        appId: window.FBid, // App ID
        channelUrl: '//tkab.wd7dev.se/channel.html', // Channel File
        status: true, // check login status
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true  // parse XFBML
    });

});


shopOpt.customCartRow = function (data, info, t) {
    /*
    if (data.ProductType == 107) {
        t.find('div.img-col').remove();
        t.find('.cart-artnr').text('Denna resa består av dessa delresor:');
    }*/
    if (data.ProductType == 201) {

        var carttime = $('<div class="cartdate">' + data.Start.format('yyyy-mm-dd') + ' ' + data.Start.format('HH:MM') + ' - ' + data.End.format('HH:MM') + '</div>').appendTo(info);
        var extxt = '';
        var $seat = $('<div class="cart-seat" />').appendTo(info);
        if (data.SeatId > 0) {
            extxt = 'Vagn:' + data.WagonId + ' Plats:' + data.SeatId;
            $seat.text(extxt);
        }
        //t.find('span.cart-price').remove();

        var b = $('<span class="button cart-bookseat" />').text(data.SeatId > 0 ? 'Byt plats' : 'Välj plats').click(function (e) {
            e.stopPropagation();
            ql.load('/js/seat.js', function () {
                bookseat(data.OrderId,data.Id);
            });
        }).appendTo($seat);
        if (data.ArticleGroup == 'Enkelbiljett') {
            $('<div class="button cart-flextoggle" />').addClass(data.Fullflex ? 'flex' : 'noflex').text(data.Fullflex ? 'Ej ombokningsbar (-30kr)' : 'Ombokningsbar (+30kr)').click(function (e) {
                ar(svcUrl + 'UpdateFlex', { id: data.Id, oid: data.OrderId, flex: !data.Fullflex, trav: '' }, function (d) {
                    wdShop.orderChanged();
                });
                e.stopPropagation();
            }).appendTo(info);
        }
    }
};

$(window).resize(function () {
    windowwidth = $(window).width();
    windowheight = $(window).height();
});
if (windowwidth > 767) {
    shopOpt.dontCloseCartOnClick = 0;
    console.log(windowwidth);
    var lastPos = 0;
    //var isScrolling = false;
    var scrollT;
    var showT;
    var headElm = $('#scrolltop');
    $(window).scroll(function (e) {
        var np = $(window).scrollTop();
        var diff = lastPos - np;
        headElm.toggleClass('isscrolling', np > 120);
        if (diff < 5) {
            headElm.stop();
            if (scrollT)
                clearTimeout(scrollT);
            if (showT)
                clearTimeout(showT);
        } else if (diff < 10) {
            headElm.stop().animate({ top: 0 }, 200);
        }

        //isScrolling = true;
        scrollT = setTimeout(function () {
            lastPos = np;
            showT = setTimeout(function () {
                headElm.stop().animate({ top: 0 }, 200);
            }, 800);
        }, 330);

        //console.log(
        /*if (diff>80){
        
            $('#eq').hide();
        }*/
        if (diff < 0) {
            headElm.css({ top: -Math.min(-diff, 66) });
        }

        //console.log(diff);
    });

    $('input.stationlist').focus(function () {
        $('.fromto label').removeClass('focus');
        $(this).prev('label').addClass('focus');
    });
    //$('.searchexp').click(function () {
    //    $(this).parent().toggleClass('middlehide');
    //});
    $('.searchexp').toggle(function () {
        $(this).parent().css({ 'height': '240px' });
        $(this).addClass('active');
    }, function () {
        $(this).parent().css({ 'height': '50px' });
        $(this).removeClass('active');
    });
}
else {
    shopOpt.dontCloseCartOnClick = 1;
    $('#menubtn').click(function () {
        $('body').toggleClass('menuopen').removeClass('cartopen');
        //$('#mmenu').toggleClass('menuopen');
        //$('#wrapper').toggleClass('wrapopen');
        //$('#mobilefoot').toggleClass('wrapopen');
    });
    //$('#pagecnt').click(function () {
    //    $('#wrapper').removeClass('wrapopen');
    //    $('#mmenu').removeClass('menuopen');
    //    $('#mobilefoot').removeClass('wrapopen');
    //});
    $('.cartbtn').click(function () {
        $('body').toggleClass('cartopen').removeClass('menuopen');
        //$('.cartwrap').toggleClass('menuopen');
        //$('#wrapper').toggleClass('cartopen');
        //$('#mobilefoot').toggleClass('cartopen');
    });

    $('.tooltip').click(function () {
        $(this).children('span').toggle();
    });



    setTimeout(function () {
        $('.wd-cart-prod').on('click', function () {
            if ($(this).hasClass('shop-parent'))
                $(this).parent().toggleClass('askdel');
            else
                $(this).toggleClass('askdel');
        });
    }, 1500);
    $('#mmenu li.showexp >a').click(function (e) {
        e.preventDefault();
        $(this).parent().find('ul').toggleClass('active');
    });
    $('#mmenu li.showexp span.clickable').click(function () {
        var url = $(this).prev('a').attr('href');
        window.location.href = url;
    });
}
$('input#travelback').change(function () {
    $('.showdate').toggleClass('active');
    $(this).prev('label').toggleClass('active');
    //if (this.checked)
    //    $('.returnwrap').slideDown();
    //else
    //    $('.returnwrap').slideUp();
});
//$('#mtravelback input').click(function () {
//    if ($(this)) {
//        $(this).toggleClass('active');
//        $('.returnwrap').slideDown();
//        var checkBox = $('input#mtravelback');
//        checkBox.prop('checked', !checkBox.prop('checked'));
//        setMobileReturnDate(new Date());
//    }
//    else
//        $('.returnwrap').slideUp();

//});
function setButtonHeight() {
    //var searchHeight = $('.fromto').outerHeight();
    //searchHeight += $('.white').outerHeight();
    var searchHeight = 0;
    $('.middlesearch .measure').each(function () {
        searchHeight += $(this).outerHeight();
    });
    $('.searchbox').css('height', searchHeight);
}
setButtonHeight();
$('.middlesearch ul.tabs li').click(function () {
    setButtonHeight();
});
/*
$('.addtraveler').click(function () {
    var row = $(this).prev().find('div.travelerrow').first().clone(true);
    $($('<input type="text" placeholder="Namn" />')).appendTo(row);
    $('<span class="delrow" />').appendTo(row);
    $(row).insertAfter($(this).prev().find('div.travelerrow').last());
    row.find('ul').children('li').removeClass('selected');
    row.find('ul li').eq(0).addClass('selected');
    setButtonHeight();
});
*/

$(window).bind('orderUpdated', function (e,order, newItems, extr) {
    
    $('#cnoi').text(order.items.length).toggle(order.items.length > 0);
    
        
});

setTimeout(function () {
    $('.wd-cart-prod a').on('click', function (e) {
        e.preventDefault();
        return false;
    });
}, 1500);

$('.increase').click(function () {
    var obj = $(this).prev('div');
    var noi = obj.text(parseInt(obj.text()) + 1);
});
$('.decrease').click(function () {
    var obj = $(this).next('div');
    var noi = parseInt(obj.text());
    if (noi == 1)
        noi = 1;
    else
        noi--;
    obj.text(noi);
});

$('.dropselected').click(function () {
    $(this).next('ul').toggleClass('active');
});

$('ul.dropdown li').click(function () {
    $(this).addClass('selected');
    var selecteddiv = $(this).parent().parent().find('div.dropselected');
    var text = $(this).text();
    selecteddiv.empty().text(text);
    $(this).parent().removeClass('active');
});
function activetab() {
    var nr = $('.searchwrapper ul.tabs li.tbactive').index();
    $('.traveltype').removeClass('active');
    $('.traveltype').eq(nr).addClass('active');
}
activetab();
$('.searchwrapper ul.tabs li').click(function () {
    activetab();
});


function fb_publish(d) {
    var stn = station[d.EndStation].n.short();
    FB.ui(
      {
          method: 'stream.publish',
          message: 'Åker tåg till ' + stn,
          attachment: {
              name: 'Åker tåg till ' + stn,
              caption: 'Tågkompaniets tåg ' + d.TripNr + ': ' + d.Description,
              description: (
                'description here'
              ),
              href: 'http://www.tagkompaniet.se'
          },
          //action_links: [
          //            { text: 'Code', href: 'action url here' }
          //],
          user_prompt_message: 'Personal message here'
      },
      function (response) {
          if (response && response.post_id) {
              alert('Post was published.');

          } else {
              //alert('Post was not published.');
          }
      }
    );
}


function openTicket(data) {
    var cnt = $('<div class="ticketview" />').appendTo($('body'));
    ql.postload('/js/stations.js');
        $('<div class="close"></div>').click(function () {
        $(this).parent().remove();
    }).appendTo(cnt);
    $('<div class="ordernr">Ordernummer: <strong>' + data.OrderId + '</strong></div>').appendTo(cnt);
    $('<div class="ticketnr text-right"><strong>' + data.Code.substring(0,data.Code.length-1) + '</strong></div>').appendTo(cnt);
    //$('<div>' + data.ArticleGroup + '</div>').appendTo(cnt);
    $('<div class="tickettype">' + data.Title.short() + '</div>').appendTo(cnt);
    
    $('<div class="tickettype">' + data.Description.short() + '</div>').appendTo(cnt);
    $('<div class="ticketinfo"><span>Namn:</span>&nbsp;<strong>' + data.Traveller + '</strong></div>').appendTo(cnt);
    if (data.ArticleGroup == "Pendlarkort") {
        $('<div class="ticketinfo"><span>Personnummer:</span>&nbsp;<strong>' + data.OrgNr + '</strong></div>').appendTo(cnt);
        $('<div class="ticketinfo"><span>Giltighetstid:</span>&nbsp;<strong>' + data.Start.format('yyyy-mm-dd') + ' - ' + data.End.format('yyyy-mm-dd') + '</strong></div>').appendTo(cnt);
    }
    else if (data.ArticleGroup == "Partibiljett") {
        $('<div>Antal partibiljetter kvar: <span class="noileft"><strong>' + (data.Noi - data.UsedNoi) + '</strong></span></div>').appendTo(cnt);
    } else {
        $('<div class="ticketinfo"><span>Tågnummer:</span>&nbsp;<strong>' + data.TripNr + '</strong></div>').appendTo(cnt);
        $('<div class="ticketinfo"><span>Datum:</span>&nbsp;<strong>' + data.Start.format('yyyy-mm-dd') + '</strong></div>').appendTo(cnt);
        $('<div class="ticketinfo"><span>Avgång:</span>&nbsp;<strong>' + data.Start.format('HH:MM') + '</strong></div>').appendTo(cnt);
        $('<div class="ticketinfo"><span>Ankomst:</span>&nbsp;<strong>' + data.End.format('HH:MM') + '</strong></div>').appendTo(cnt);
        $('<div class="ticketinfo"><span>Din plats:</span>&nbsp;<strong>Vagn:' + data.WagonId + ', Plats:' + data.SeatId + ' </strong></div>').appendTo(cnt);
        var b = $('<span class="button cart-bookseat" />').text(data.SeatId > 0 ? 'Byt plats' : 'Välj plats').click(function (e) {
            cnt.remove();
            e.stopPropagation();
            ql.load('/js/seat.js', function () {
                bookseat(data.OrderId, data.Id);
            });
        }).appendTo(cnt);
        if (window.FB) {
            $('<div class="button postfb fbbutton">Posta på Facebook</div>').click(function () { fb_publish(data); }).appendTo(cnt);
        }
    }
    if (data.ArticleGroup != "Partibiljett") {
        $('<img src="/gen.img?qr=' + encodeURI(data.Code) + '">').appendTo(cnt);
    } else {
        var sbtn = $('<span class="button">Boka biljetter</span>').click(function () {
            icnt.slideToggle();
            sbtn.toggle();
        }).appendTo(cnt);
        var icnt = $('<div class="convertticket" style="display:none" />').appendTo(cnt);
        var from = data.StartStation;
        var to = data.EndStation;
        var seldate = new Date();
        $('<span class="seltime title"/>').text('Datum').appendTo(icnt);
        var date = $('<span>&nbsp;</span>').datepicker({
            gotoCurrent: true,
            onSelect: function (e, ui) {

                seldate = $(this).datepicker("getDate");

                findTrips();
            }
        }).appendTo(icnt);
        $('<span class="departure title"/>').text('Avgång').appendTo(icnt);
        var tripcnt = $('<select />').appendTo(icnt);
        $('<br/>').appendTo(icnt);
        var switchbtn = $('<span class="button">Byt riktning</span>').click(function () {
            var tmp = from;
            from = to;
            to = tmp;
            findTrips();
        }).appendTo(icnt);

        var buybtn = $('<span class="button">Köp biljett</span>').click(function () {
            ar(svcUrl + 'ConvertTrip', { oid: data.OrderId, id: data.Id, tripid: tripcnt.val(), noi: 1, from: from, to: to }, function (d) {
                if (d) {
                    alert('Din biljett är nu köpt');
                    cnt.find('span.noileft').text((d.Noi - d.UsedNoi));
                } else {
                    alert('Biljetten kunde inte köpas');
                }
                icnt.slideToggle();
                sbtn.toggle();

                //wdShop.orderChanged();
                updateTickets();
            });
        }).appendTo(icnt);

        function findTrips() {
            tripcnt.empty();
            ar(svcUrl + 'FindTrips', { from: from, to: to, when: seldate }, function (d) {

                $.each(d.Result, function (i, t) {
                    tripcnt.append('<option value="' + t.uid + '">' + station[from].n.short() + ' ' + t.StartTime.format('HH:MM') + ' till ' + station[to].n.short() + ' ' + t.EndTime.format('HH:MM') + '</option>');
                });
            });
        }

        findTrips();
    }

}

//var $wrapper = $('#wrapper');
//var lastX = 0;
//var lastMat;
//var bdy = $('body');

//$('body').bind('tdown', function (e, startpos, starttime, dist, direction) {
//    var lastMat = $wrapper.css("-webkit-transform");
//    lastX = lastMat.split(',')[4] - 0;
//}).bind('tmove', function (e, startpos, starttime, dist, direction) {
//    if (direction == 1) {
//        $wrapper.css("-webkit-transition-duration", "0s");
//        //console.log(lastX, dist.x);
//        var value = lastX + dist.x;


//        if (value > 0 && value < 30) {

//            bdy.addClass('menuopen').removeClass('cartopen');

//        } else if (value < 0 && value > -30) {

//            bdy.addClass('cartopen').removeClass('menuopen');

//        }

//        $wrapper.css("-webkit-transform", "matrix(1, 0, 0, 1, " + value + ", 0) ");
//    }
//    //console.log('move');
//}).bind('tend', function (e, startpos, starttime, dist, direction) {
//    //console.log('end');
//    if (direction == 1) {
//        $wrapper.css("-webkit-transition-duration", "0.3s").css("-webkit-transform", "");
//        //console.log(dist);
//        if (Math.abs(dist.x) > 40) {
//            if (lastX != 0)
//                $('body').removeClass('menuopen').removeClass('cartopen');
//        }
//    }
//});


function activateTicket(trip) {
    var cnt = $('<div class="ticketview" />').appendTo($('body'));
    $('<div class="close"></div>').click(function () {
        $(this).parent().remove();
    }).appendTo(cnt);

}

function enumTickets(arr, cnt) {
    if (arr && arr.length) {
        $.each(arr, function (i, v) {
            console.log(v);
            var t = $('<li class="cf" />').data('data', v).click(function () {
                openTicket(v);
            }).appendTo(cnt).append('<span class="desc">' + v.Title.short() + '<br/>' + (v.Description || '').short() + '</span>');
            if (v.ArticleGroup == "Pendlarkort") {
                var dat = v.End;
                if (v.Start > new Date()) {
                    $('#inactivecom').show();
                    t.addClass('notstarted').unbind('click');
                    dat = v.Start;
                }
                var days = ((dat.getTime() - new Date().getTime()) / (3600000 * 24));
                $('<span class="time commuter" />').text(Math.round(days)).appendTo(t).append('<span class="enddate">' + dat.format('yy-mm-dd') + '</span>');
            } else if (v.ArticleGroup == "Partibiljett") {

                $('<span class="multinoi" />').text((v.Noi - v.UsedNoi)).appendTo(t);
            } else {
                var time = $('<span class="time" />').text(v.Start.format('yy-mm-dd HH:MM') + ' - ' + v.End.format('HH:MM')).appendTo(t);
            }
        });
    }
}

function updateTickets() {
    ar(svcUrl + 'MyTickets', {}, function (d) {
        if (d.IsLoggedIn) {
            $('.mytickets').show();
            enumTickets(d.Single, $('ul.yourticket').empty());
            enumTickets(d.Multi, $('ul.yourmultiticket').empty());
            enumTickets(d.Commuter, $('ul.yourcommuter').empty());
            enumTickets(d.NoStartCommuter, $('ul.upcomingcommuter').empty());
        }
        else
            $('.mytickets').hide();
    });
}

if (windowwidth < 768) {
    var bdy = $('body'), startpos;
    
    $('#scrolltop').prependTo(bdy).addClass('ani');

    function getPos(e) {
        if (e.changedTouches)
            e = e.changedTouches[e.changedTouches.length - 1];
        return { x: e.pageX, y: e.pageY };
    }

   
    bdy[0].addEventListener('touchstart', function(e) {
        if (bdy.hasClass('menuopen') || bdy.hasClass('cartopen')) {
            startpos = getPos(e);
            //console.log('start', startpos);
        }
    }, false);
    bdy[0].addEventListener('touchmove', function (e) {
        if (bdy.hasClass('menuopen') || bdy.hasClass('cartopen')) {
            if (startpos) {

                var endp = getPos(e);
                //console.log('end', endp);
                var diff = { x: startpos.x - endp.x, y: startpos.y - endp.y };
                //console.log('diff');
                startpos = null;
                if (Math.abs(diff.x) > Math.abs(diff.y)) {
                    e.stopPropagation();
                    if (diff.x > 0) {
                        bdy.removeClass('menuopen');
                    } else
                        bdy.removeClass('cartopen');
                }
            }
        }
    }, false);
    
}
//(function () {
//    var isdown = false;

//    var startpos, starttime;
//    var elm;
//    var isdragging;
//    var mindist = 5;
//    var direction;
//    var lastDist;
//    var bdy = document.body;

//    function getPos(e) {
//        if (e.changedTouches)
//            e = e.changedTouches[e.changedTouches.length - 1];
//        return { x: e.pageX, y: e.pageY };
//    }
//    function tstart(e) {

//        elm = $(e.srcElement);
//        isdown = true;
//        startpos = getPos(e);
//        starttime = new Date();
//    }
//    function tmove(e) {



//        if (isdown) {





//            var newpos = getPos(e);

//            var dist = lastDist = { x: newpos.x - startpos.x, y: newpos.y - startpos.y };
//            if (!isdragging) {

//                var ax = Math.abs(dist.x);
//                var ay = Math.abs(dist.y);
//                if (ax > mindist || ay > mindist) {
//                    isdragging = true;
//                    direction = ax > ay;
//                }
//                if (elm)
//                    elm.trigger('tdown', [startpos, starttime, dist, direction, elm]);
//            } else {
//                if (direction == 1)
//                    e.preventDefault();
//                if (elm)
//                    elm.trigger('tmove', [startpos, starttime, dist, direction, elm]);
//            }

//        }
//    }
//    function tend(e) {
//        if (isdown) {

//            elm.trigger('tend', [startpos, starttime, lastDist, direction, elm, getPos(e)]);
//            isdragging = false;
//        }
//        if (isdragging) {
//            if (e.type == 'touchend')
//                e.preventDefault();
//            e.stopPropagation();

//        }
//        elm = null;
//        isdown = false;

//    }
//    bdy.addEventListener('touchstart', tstart, false);
//    bdy.addEventListener('touchmove', tmove, false);
//    bdy.addEventListener('touchend', tend, false);
//})();

setTimeout(function() {
    updateTickets();
    $('#pageload').fadeOut();
}, 200);


function checkClose() {





    setTimeout(function () {

        if (!$('#loginpop').is(":hover"))
            $('#loginpop').removeClass('active');
        else
            checkClose();

    }, 6000);


}
if (!window.wdGlobal) {
    setTimeout(function () {
        $('#loginpop .close').click(function () {
            $(this).parent().removeClass('active');
        });
        var cid = $.cookie('customerId');
        if (!cid) {
            $('#loginpop').addClass('active');
            checkClose();

        }
    }, 3000);
}

$('#loginpop .button').click(function () {
    $('#ctl00_Login1').click();
});

setTimeout(function() {
    loadFB();
}, 1000);

fd('base.js');