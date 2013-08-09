

//(function() {
//})();


var map,
    pins = [],
    flightPath,
    cardAvail,
    baseTrip,
    $from = $('#from'),
    $to = $('#to'),
    $commutercnt = $('#commutercnt'),
    $multicnt = $('#multicnt'),
    tccnt = $('#tripresult'),
    returncnt = $('#returnresult'),
    $travelfrom = $('#travelfrom'),
    $when = $('#mwhen, #when'),
    $return = $('#mreturn, #return'),
    $backtravelfrom = $('#backtravelfrom'),
    $tripday = $('#tripday'),
    $returnday = $('#returnday'),
    $triptime = $('#mwhentime'),
    $returntime = $('#mreturntime'),
    lastdata = JSON.parse($.cookie('laststation')),
    now = new Date(),
    date = new Date(),
    returndate = new Date(),
    commuterdate = new Date(),
    startTime = date.inmin(),
    
    monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
    dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
    returnTime = date.inmin();

if (lastdata && lastdata.to) {
    var ss = station[lastdata.to];
    var es = station[lastdata.from];
    $to.data('station-id', lastdata.to).val(windowwidth < 768 ? ss.n.short() : ss.n);
    $from.data('station-id', lastdata.from).val(windowwidth < 768 ? es.n.short() : es.n);
}

function GetPrice(trip, travellers) {
    var prc = 0;
    $.each(trip.subTrips, function (i, v) {
        var p = v.Price;
        prc += p.Full * travellers.full || 0;
        prc += p.Youth * travellers.youth || 0;
    });
    return prc;
}

function updateMultiPrice(t) {
    var trav = getTravellers('#multitraveler');
    var pc = { full: 0, youth: 0 };
    $.each(trav, function () {
        if (this.Type == 1)
            pc.full++;
        else pc.youth++;
    });
    var prc = GetPrice(t, pc);
    $('.multiprice').each(function () {
        var mul = $(this).data('mul') - 0;
        var noi = $(this).data('noi') - 0;
        console.log(mul, noi);
        $(this).html(noi + 'st <span class="price">' + wdShop.currFormat(prc * mul * noi) + "</span>");
    });

}


function getTravellers(parent) {
    var ret = [];
    parent = parent || '#traveler';
    $(parent + ' .travelerrow select').each(function () {
        var nameo = $(this).parent().find('input');
        var name = '';
        if (nameo && nameo.val()) {
            name = nameo.val();
        }
        ret.push({ Name: name, Type: $(this).val() });
    });
    return ret;
}

function noiTrav(d,t) {
    var r = 0;
    $.each(d, function(i, v) {
        if (v.Type == t)
            r++;
    });
    return r;
}

function calcPrice(p) {
    var ret = 0;
    var trav = getTravellers();
    var full = noiTrav(trav, 1);
    var child = 0;
    $.each(trav, function (i, v) {
        if (v.Type == 1) {
            ret += p.Full;
        }
        else if (v.Type == 3) {
            if (child < full * 2) {
                ret += 5;
            } else {
                ret += p.Youth;
            }
            child++;
        } else if (v.Type == 4) {
            
            ret += p.Youth;
            
        } else if (v.Type == 2) {
            ret += p.Youth;
        }
    });
    return ret;
}

function prebuy(o) {
    o.addClass('buying');
    $('#pageload').show();
}

function afterbuy(o) {
    wdShop.orderChanged();
    o.removeClass('buying').addClass('incart');
    $('#pageload').hide();
    if (windowwidth < 768)
        $('body').removeClass('menuopen').addClass('cartopen').scrollTop(0);
    else
        window.location.href = '/checkout';
}


function appendTrip(t, tc) {
    var tot = 0,
        toty = 0,
        totp = 0,
        isown = true,
        mtime = 0,
        cnt = $('<div class="trip flipparent cf" />').data('data', t).bind('maxtime', function (e, time) {
            var percent = t.TotalTime.TotalMinutes / time;
            if (windowwidth < 758 && t.subTrips.length > 2)
                totalline.css('width', '450px');
            else
            totalline.css('width', (percent * 90) + '%');

        }).click(function (e) {
            e.stopPropagation();
            icnt.toggleClass('open');
            $(this).toggleClass('open');
            //var thisitem = $(this);
            //if($(thisitem).hasClass('open')) {
            //    setTimeout(function () {
            //        var chosenHeight = $(thisitem).outerHeight() / 2;
            //        console.log(chosenHeight);
            //        $(thisitem).children().find('.chosen').css({ 'border-top': chosenHeight + 'px solid #B71135', 'border-bottom': chosenHeight + 'px solid #B71135', 'opacity' : '1' });
            //    }, 500);
            //}
            //else
            //    $(thisitem).children().find('.chosen').css('opacity', '0');

        }).mouseenter(function () {
            if (usegmap) {
                if (flightPath)
                    flightPath.setMap(null);
                flightPath = new google.maps.Polyline({
                    path: t.lines,
                    strokeColor: "#588e89",
                    strokeOpacity: 1.0,
                    strokeWeight: 5
                });
                var bounds = new google.maps.LatLngBounds();
                $.each(t.lines, function (i, v) {
                    bounds.extend(v);
                });
                $.each(pins, function (i, v) {
                    v.setMap(null);
                });
                t.startm.setMap(map);
                t.endm.setMap(map);

                $.each(t.subTrips, function (i, v) {
                    //console.log(v.m);
                    if (v.m)
                        v.m.setMap(map);
                });
                flightPath.setMap(map);
                map.panTo(bounds.getCenter());
                map.fitBounds(bounds);
            }
        }).appendTo(tc);
    //console.log(t);
    var changes = t.TotalChanges - 1,
        title = $('<div class="triphead"><span class="starttime">' + t.StartTime.format('HH:MM') + '</span><span class="timeto"></span><span class="arrivetime">' + t.EndTime.format('HH:MM') + '</span><span class="changes">' + changes + '</span><span class="traveltime">' + t.TotalTime.Hours + 'h ' + t.TotalTime.Minutes + 'min</span></div>').appendTo(cnt),
        travelfrom = station[t.fromId].n.short(),//$('input#from').val().short(),
        travelto = station[t.toId].n.short(), //$('input#to').val().short(),
        tottime = t.TotalTime.TotalMinutes;

    

    //Längsta resa
    

    var prc = $('<span class="tprice" />').appendTo(title),
        icnt = $('<div class="subtrips flip" />').click(function (e) {
            e.stopPropagation();
        }).appendTo(cnt),
        fromto = $('<div class="fromto" />').empty().text(t.StartTime.format('HH:MM') + ' ' + travelfrom + ' - ' + t.EndTime.format('HH:MM') + ' ' + travelto).appendTo(icnt),
        owncnt = $('<div class="own" />').appendTo(title),
        addcart = $('<div class="addtocartbutton" />').text('Lägg till i kundvagn').click(function (e) {
            ar(svcUrl + 'BookTrip', { tripid: t.uid, noi: 1, from: t.fromId, to: t.toId, type: 1, ttype: 1, startdate: commuterdate, traveller: getTravellers(), fullflex: false }, function (d) {
                wdShop.orderChanged();
                $('body').removeClass('menuopen').addClass('cartopen').scrollTop(0);
            });
            e.stopPropagation();
        }), //.appendTo(owncnt),

        sel = $('<input type="radio" name="' + tc.attr('id') + '" value="' + t.uid + '" />').click(function (e) {
            e.stopPropagation();
            $('#buytrip').addClass('active');
            if(windowwidth > 768)
                $('body').scrollTo($('#buytrip').offset().top - 200, 200);
            else
                $('body').scrollTo($('#buytrip').offset().top - 50, 200);
            
        }).appendTo(owncnt),
        buy = $('<div class="bookbutton" />').text('Köp direkt').click(function (e) {
            prebuy(buy);
            
            ar(svcUrl + 'BookTrip', { tripid: t.uid, noi: 1, from: t.fromId, to: t.toId, type: 1, ttype: 1, startdate: commuterdate, traveller: getTravellers(), fullflex: false }, function (d) {
                //window.location.href = '/checkout';
                //$('body').removeClass('menuopen').addClass('cartopen').scrollTop(0);
                //wdShop.orderChanged();
                afterbuy(buy);
            });
            e.stopPropagation();
        }).appendTo(owncnt),
    totalline = $('<div class="cf totalline" />').appendTo(icnt).wrap('<div class="wrapline" />');

    //console.log('trip', t.StartTime);

    if (t.StartTime < now) {
        sel.hide();
        buy.hide();
        cnt.addClass('oldtrip');
    }

    $('<div class="cf showdet">Detaljerad resväg</div>').click(function () {
        $(this).parent().toggleClass('active').children('div.subtrip').each(function () {
            if ($(this).hasClass('open'))
                $(this).removeClass('open');
            else
                $(this).addClass('open');
        });
    }).appendTo(icnt);



    t.lines = [];

    function addmarker(stn, icon) {
        var o = { position: new google.maps.LatLng(stn.y, stn.x), title: stn.n, icon: icon }; //, animation: google.maps.Animation.DROP
        var m = new google.maps.Marker(o);
        pins.push(m);
        return m;
    }

    var startStn = t.subTrips[0];
    var endStn = t.subTrips[t.subTrips.length - 1];
    if (usegmap) {
        t.startm = addmarker(station[startStn.FromId], '/images/icons/map-start.png');
        t.endm = addmarker(station[endStn.ToId], '/images/icons/map-flag.png');
    }
    $.each(t.subTrips, function (i, v) {

        v.from = station[v.FromId];
        v.to = station[v.ToId];
        v.time = (v.Arrival.getTime() - v.Departure.getTime()) / (1000 * 60);


        if (v.time > mtime)
            mtime = v.time;
        var iown = true;

        if (v.Trip.CompanyNr != 314 && v.Trip.CompanyNr != 315) {
            isown = false;
            iown = false;
        }
        if (usegmap) {
            // Add lines to trip
            t.lines.push(new google.maps.LatLng(v.from.y, v.from.x));
            $.each(v.StationList, function (j) {

                var e = station[v.StationList[j]];

                t.lines.push(new google.maps.LatLng(e.y, e.x));
            });
            t.lines.push(new google.maps.LatLng(v.to.y, v.to.x));
            // End add lines

            if (i > 0 && i < t.subTrips.length) {
                v.m = addmarker(v.from, '/images/icons/map-change.png');
                console.log('trip', v);
            }

        }

        if (v.Wait > 0) {
            $('<div class="subtrip wait">' + v.Wait + 'minuter väntetid</div>').appendTo(icnt);
            $('<div class="subline wait" />').text(v.Wait.timeSpan()).css({ width: (v.Wait / tottime) * 100 + '%' }).appendTo(totalline);
        }


        $('<div class="subline" />').text(v.time.timeSpan()).css({ width: (v.time / tottime) * 100 + '%' }).addClass('v' + v.Trip.Vehicle).appendTo(totalline).toggleClass('ownsubtrip', iown);
        totp += calcPrice(v.Price);
        tot += v.Price.Full;
        toty += v.Price.Youth;
        $('<div class="subtrip ani"><span class="fromdate"><strong>' + v.Departure.format('HH:MM') + '</strong></span> <span class="fromcity">' + v.from.n.short() + '</span> - <strong><span class="todate">' + v.Arrival.format('HH:MM') + '</strong></span> <span>' + v.to.n.short() + '</span><span class="tripnr">TripNr:' + v.Trip.TripName + '</span><span class="sprice">' + calcPrice(v.Price) + 'kr</span></div>').appendTo(icnt).toggleClass('ownsubtrip', iown);

    });
    $('<div class="notowninfo"><div><p>Tyvärr går denna ej att boka via appen, men kontakta vårat servicecenter så hjälper vi dig.</p></div><div class="cf"><a href="tel:0000" class="phoneinfo">Ring</a><a href="#" class="chatinfo">Chatta</a></div>').appendTo(icnt);
    if (!isown) {
        owncnt.remove();
        $('<span class="bookwarn" />').text('Denna resa går ej att boka').appendTo(title);
        cnt.toggleClass('notown');
    } else {
        //cardprice.text((tot * 10) + "kr");
        updateMultiPrice(t);
        //$multicnt.addClass('slideappear');
        baseTrip = t;
        if (cardAvail) {
            /* 
             var bcard = $('<div class="button bookbutton bookcard" />').text('Pendlarkort').click(function(e) {
                 ar(svcUrl+'BookTrip', { tripid: t.uid, noi: 1, from: t.fromId, to: t.toId, type: 2, ttype: 1 }, function(d) {
                     wdShop.orderChanged();
                 });
                 e.stopPropagation();
             }).appendTo(owncnt);
             cardprice.appendTo(bcard);*/
            //$commutercnt.addClass('slideappear');
            $('.buycom[data-age="1"]').html('Vuxen <span class="price">' + wdShop.currFormat(tot * 10) + '</span>');
            $('.buycom[data-age="2"]').html('Ungdom <span class="price">' + wdShop.currFormat(toty * 10) + '</span>');
            //$('#comprice').text(wdShop.currFormat(tot * 10));
        }

        prc.text(wdShop.currFormat(totp));
    }
    cnt.toggleClass('owntrip', isown);

    return cnt.data('data', t);
}



function findto(from, to) {
    tccnt.find('.trip').removeClass('appeared');
    $commutercnt.removeClass('slideappear');
    $multicnt.removeClass('slideappear');

    $travelfrom.empty().append(station[from].n.short() + ' - ' + station[to].n.short());
    
    
    ar(svcUrl + 'FindTrips', { from: from, to: to, when: date }, function (d) {
        tccnt.empty();
        $('#basetrip').addClass('showload');
        var mt = 0;
        var it = 0;
        $.each(d.Result, function (i, v) {
            v.fromId = from;
            v.toId = to;
            if (v.TotalTime.TotalMinutes > mt)
                mt = v.TotalTime.TotalMinutes;
            var cnt = appendTrip(v, tccnt);
            //setTimeout(function () {
            //    cnt.addClass('appeared');
            //}, i * 130);
            setTripData(startTime, cnt, it++,getArrTrip());

        });
        if (windowwidth < 768)
            $('html, body').animate({ scrollTop: $('#basetrip').offset().top + 20 });
        tccnt.find('.trip').trigger('maxtime', [mt]);
        //console.log('trip',mt);
    });
}



function setTripData(sTime, cnt, i, arr) {
    var v = cnt.data('data');
    //cnt.parents('.tripparent').find('.prevtimes').show();
    //cnt.parents('.tripparent').find('.nexttimes').show();
    var inmin = v[arr ? 'EndTime' : 'StartTime'].inmin();
    
    if ((!arr && sTime < inmin && (sTime + (6 * 60) > inmin)) || (arr && (sTime + (3 * 60)) > inmin)) {
        if (arr && (sTime <= inmin)) {
            cnt.addClass('passedtime');
        } else {
            cnt.removeClass('passedtime');
        }
        setTimeout(function () {
            cnt.addClass('appeared').removeClass('posttime').removeClass('pretime');
        }, i * 130);
    } else {
        cnt.removeClass('appeared').removeClass('passedtime');
        if (sTime < inmin) {
            
            cnt.addClass('posttime').removeClass('pretime');
        } else {
            
            cnt.addClass('pretime').removeClass('posttime');
        }
    }
    var hasprev = !!cnt.parent().find('.pretime').length;
    var hasnext = !!cnt.parent().find('.posttime').length;
    
    cnt.parents('.tripparent').find('.prevtimes').toggle(hasprev);
    cnt.parents('.tripparent').find('.nexttimes').toggle(hasnext);

    if (!hasprev && !hasnext) {

    }

    cnt.data('inmin', inmin);
}




function findreturn(from, to) {
    returncnt.find('.trip').removeClass('appeared');
    $backtravelfrom.empty().append(station[to].n.short() + ' - ' + station[from].n.short());
    ar(svcUrl + 'FindTrips', { from: to, to: from, when: returndate }, function (d) {
        returncnt.empty();
        $('#returntrip').addClass('showload');
        var mt = 0;
        var it = 0;
        $.each(d.Result, function (i, v) {
            v.fromId = to;
            v.toId = from;
            if (v.TotalTime.TotalMinutes > mt)
                mt = v.TotalTime.TotalMinutes;
            var cnt = appendTrip(v, returncnt);
            setTripData(returnTime, cnt, it++, getArrReturn());
        });

        returncnt.find('.trip').trigger('maxtime', [mt]);
    });
}



$.fn.weeksel = function (opt) {
    $(this).each(function () {

        var d = opt.date || new Date();
        var days;
        var t = $(this).bind('changeday', function (e, date) {
            d = date;
            genDays();
        });

        function changeDay(nod) {
            d = d.addDays(nod);

            var trans = -(nod + 3) * 100;

            t.find('div.day').css({ '-webkit-transform': 'translate(' + (trans) + '%,0px)', '-moz-transform': 'translate(' + (trans) + '%,0px)', 'transform': 'translate(' + (trans) + '%,0px)' });
            setTimeout(function () {
                genDays();
            }, 500);




            if (opt.onchange)
                opt.onchange(d);
        }

        function genDays() {
            t.empty();
            $('<div class="week prev" />').html('<span>&laquo;</span>').click(function () {
                changeDay(-2);
            }).appendTo(t);
            dayscnt = $('<div class="days" />').appendTo(t);
            days = $('<div class="dayscnt" />').appendTo(dayscnt);
            for (var i = -4; i < 6; i++) {
                (function (j) {
                    var nd = d.addDays(j);
                    var dd = $('<div class="day ani" />').text(dayNames[nd.getDay()]).append($('<span class="dom" />').text(nd.getDate() + ' ' + monthNames[nd.getMonth()])).click(function () {
                        days.find('.today').removeClass('today');
                        $(this).addClass('today');
                        changeDay(j);
                    }).appendTo(days);
                    if (j == 0)
                        dd.addClass('today');
                })(i);

            }
            $('<div class="week next" />').html('<span>&raquo;</span>').click(function () {
                changeDay(2);
            }).appendTo(t);
        }

        genDays();
    });
};



function findtrip(updtrip, updreturn) {
    var from = $from.data('station-id');
    var to = $to.data('station-id');
    if (from && to && from != to) {


        $.cookie('laststation', JSON.stringify({
            from: from,
            to: to
        }), { path: '/', expires: 200 });



        if (updtrip) {

            findto(from, to);
        }

        if (updreturn && $('#travelback').is(':checked')) {

            findreturn(from, to);
        }


        var froms = station[from];
        var tos = station[to];
        cardAvail = (froms.c != tos.c);


    }
}



function getDist(x, y, x2, y2) {
    var deltaX = x2 - x;
    var deltaY = y2 - y;
    return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
}

if (navigator.geolocation) {
    if ((!lastdata || !lastdata.from)) //windowwidth<768 || 
        navigator.geolocation.getCurrentPosition(function (d) {

            var x2 = d.coords.longitude,
                y2 = d.coords.latitude,
                dist = [];

            $.each(station, function (i, v) {
                v.dist = getDist(v.x, v.y, x2, y2);
                v.id = i;
                dist.push(v);
            });
            dist = dist.sort(function (a, b) {
                return a.dist - b.dist;
            });
            /*
            $from.data('station-id', dist[0].id).val(dist[0].n);
            if (lastdata || lastdata.to) {
                findtrip(true, false);
            }*/
        });
}

window.validate = function (id) {
    ar(svcUrl + 'GetBookingInfo', { id: id }, function (d) {
        console.log(d);
    });
};




$('.prevtimes').click(function () {
    $(this).hide();
    $($(this).parents('.tripparent').find('.pretime').removeClass('pretime').get().reverse()).each(function (i, v) {
        setTimeout(function () {
            $(v).addClass('appeared');
        }, i * 100);
    });
});
$('.nexttimes').click(function () {
    $(this).hide();
    $(this).parents('.tripparent').find('.posttime').removeClass('posttime').each(function (i, v) {
        setTimeout(function () {
            $(v).addClass('appeared');
        }, i * 100);
    });
});

$("#to, #from").change(function () { findtrip(true, true); });
$from.change(function () {
    $('#findmore').addClass('showhidden');
});

$('#swap').click(function () {
    $(this).toggleClass('flip');
    var $val1 = $from.val(),
        $val2 = $to.val(),
        $valid1 = $from.data('station-id'),
        $valid2 = $to.data('station-id');

    $from.val($val2).data('station-id', $valid2);
    $to.val($val1).data('station-id', $valid1);

    findtrip(true, true);
});


$('.mtraveler .travelerrow select').live('change', function () {
    findtrip(true, true);
});

$('.addtraveler').click(function () {

    var row = $(this).prev().find('div.travelerrow').first().clone(true);
    $($('<input type="text" placeholder="Namn" />')).appendTo(row);
    var delrow = $('<span class="delrow" />');
    $(delrow).bind('click', function () {
        $(this).parent('div').remove();
        setButtonHeight();
        findtrip(true, true);
    });
    $(delrow).appendTo(row);
    $(row).insertAfter($(this).prev().find('div.travelerrow').last());
    //row.find('ul').children('li').removeClass('selected');
    //row.find('ul li').eq(0).addClass('selected');
    setButtonHeight();
    findtrip(true, true);
});

$("#trainsearch").change(function () {
    var stnid = $(this).data('station-id');
    if (stnid) {
        ar(svcUrl + 'GetDep', { from: stnid, when: new Date() }, function (d) {
            var prt = $('ul.traininfo');
            prt.find('.stninfo').remove();
            $.each(d, function (i, v) {
                var cnt = $('<li class="stninfo cf" />').appendTo(prt);
                var dep = v.Departure.StartStationNr == stnid ? 'Start' : 'End';
                var time = v.Departure[dep + 'TimeString'].insert(2, ':');
                var ex = $('<span class="ttime">' + time + '</span><span class="info"><a class="tooltip"><img src="/images/icons/info-icon-small.png" alt="Information" /><span class="ttxt">&nbsp;</span></a></span>').appendTo(cnt);
                $('<span class="desc">' + v.Trip.TripNr + '<br />Mot ' + v.Trip.EndStationName + '</span>').appendTo(cnt);
                var trk = $('<span class="track">&nbsp;</span>').appendTo(cnt);
                ar(svcUrl + 'GetTrainStatus', { nr: v.Trip.TripNr }, function (dd) {
                    var c = JSON.parse(dd);
                    if (c.LpvTrafiklagen && c.LpvTrafiklagen.Trafiklage) {
                        var tl = c.LpvTrafiklagen.Trafiklage;
                        var last = tl[tl.length - 1];
                        var spar = last.SparangivelseAnkomst || last.SparangivelseAvgang;
                        ex.find('span.ttxt').html(last.StatiskInformationTrafikplatsVisning);
                        ex.find('a.tooltip').toggle(!!last.StatiskInformationTrafikplatsVisning);
                        if (spar) {
                            trk.text(spar);
                        }
                    }

                });

            });

        });
    }
});


$('.buycom').click(function () {
    var trav = { Type: $(this).data('age') - 0, Name: '' };
    prebuy($(this));
    var t = $(this);
    ar(svcUrl + 'BookTrip', { tripid: baseTrip.uid, noi: 1, from: baseTrip.fromId, to: baseTrip.toId, type: 3, ttype: 3, startdate: commuterdate, traveller: [trav], fullflex: false }, function (d) {
        //if (windowwidth < 768)
        //    $('body').removeClass('menuopen').addClass('cartopen').scrollTop(0);
        //else
        //    window.location.href = '/checkout';
        //wdShop.orderChanged();
        afterbuy(t);
    });
});

$('.multiprice').click(function () {
    //var mul = $(this).data('mul') - 0;
    prebuy($(this));
    var t = $(this);
    var noi = $(this).data('noi') - 0;
    ar(svcUrl + 'BookTrip', { tripid: baseTrip.uid, noi: noi, from: baseTrip.fromId, to: baseTrip.toId, type: 2, ttype: 2, startdate: commuterdate, traveller: getTravellers('#multitraveler'), fullflex: true }, function (d) {
        
        //window.location.href = '/checkout';
        //if (windowwidth < 768)
        //    $('body').removeClass('menuopen').addClass('cartopen').scrollTop(0);
        //else
        //    window.location.href = '/checkout';
        //wdShop.orderChanged();
        afterbuy(t);
    });
});
/*
$('#buymulti').click(function () {
    var noi = 10;
    ar(svcUrl + 'BookTrip', { tripid: baseTrip.uid, noi: noi, from: baseTrip.fromId, to: baseTrip.toId, type: 2, ttype: 2, startdate: commuterdate, traveller: '', fullflex: true }, function (d) {
        window.location.href = '/checkout';
        wdShop.orderChanged();
    });
});
*/
$('#travelback').change(function () {
    findtrip(false, true);
    $('#returntrip').toggle($(this).is(':checked'));
});



$('#buytrip').click(function () {
    var t = $(this);
    var tripid = $('input[name="tripresult"]:checked').val();
    var returntripid = $('input[name="returnresult"]:checked').val();
    var trav = getTravellers();
    prebuy(t);
    ar(svcUrl + 'BookTrip', { tripid: tripid, noi: 1, from: baseTrip.fromId, to: baseTrip.toId, type: 1, ttype: 1, startdate: commuterdate, traveller: trav, fullflex: false }, function (d) {
        if (d) {
            if (returntripid) {
                ar(svcUrl + 'BookTrip', { tripid: returntripid, noi: 1, from: baseTrip.toId, to: baseTrip.fromId, type: 1, ttype: 1, startdate: commuterdate, traveller: trav, fullflex: false }, function (d2) {
                    if (d2) {
                        afterbuy(t);
                    } else {
                        showmessage('Återresan kunde inte bokas');
                    }
                });
            } else {
                afterbuy(t);
            }
        } else {
            showmessage('Resan kunde inte bokas');
        }
    });
});

function showmessage(text, type) {
    console.log(text);
}

$('#deptype span').click(function () {
    var arr = $('#deptype .active').index() == 0;
    var ij = 0;
    tccnt.find('.trip').each(function () {
        setTripData(startTime, $(this), ij++, arr);
    });
});

$('#arrtype span').click(function () {
    var arr = $('#arrtype .active').index() == 0;
    var ij = 0;
    returncnt.find('.trip').each(function () {
        setTripData(returnTime, $(this), ij++, arr);
    });
});

$('.searchbtn').click(function () {
    findtrip(true, true);
});

function getArrReturn() {
    return $('#arrtype .active').index() == 1;
}

function getArrTrip() {
    return $('#deptype .active').index() == 1;
}


var hstring = now.getHours() + ':00';

//$('#mwhentime, #mreturntime, #whentime, #whentotime').val(now.getHours() + ':00');
$('#settime, #setreturntime').text(hstring);
/*
var ft = $('.filltime');
for (var i = 0; i < 23; i++) {
    var h = i < 10 ? ('0' + i.toString()) : i.toString();
    ft.append('<option>' + h + ':00' + '</option>').append('<option>' + h + ':30' + '</option>');
}
*/
//ft.click();




//alert(navigator.appVersion);
var nav = navigator.appVersion;
var isIPad = nav.indexOf('iPad') != -1;
var useBrowser = nav.indexOf('Chrome/') != -1 || nav.indexOf('iPhone') != -1 || isIPad;

var useNativeInput = (isIPad || (windowwidth < 768 && useBrowser));

    $('.asdate').each(function () {
        try {
            this.type = 'date';
        }
        catch (e) { }
        if (this.type == 'date' && useNativeInput) {
            if ($(this).hasClass('hiddeninp')) {
                $(this).css({ overflow: 'auto', position: 'absolute', color: 'transparent', backgroundColor: 'transparent', border: '0' }).removeClass('hiddeninp').show();
            }
        } else {
            $(this).addClass('notnative');
        }
    });

    $('.astime').each(function () {
        
        try {
            this.type = 'time';
        }
        catch (e) { }
        if (this.type == 'time' && useNativeInput) {
            if ($(this).hasClass('hiddeninp')) {
                $(this).css({ overflow: 'auto', position: 'absolute', color: 'transparent', backgroundColor: 'transparent', border: '0' }).removeClass('hiddeninp').show();
            }
        } else {
            $(this).addClass('notnative');
        }
        //$(this).prop('type', 'time');
    });


if ($triptime.hasClass('notnative')) {
    $([$triptime, $returntime]).val(hstring).timepicker({
        step: 30,
        'timeFormat': 'H:i'
    });
}

$('#settime').on('click', function () {
    if ($(this).hasClass('notnative')) {
        $triptime.timepicker('show');
    } else {
        $triptime.focus();
    }
});



$('#setreturntime').on('click', function () {
    if ($(this).hasClass('notnative')) {
        $returntime.timepicker('show');
    }
    else
        $returntime.focus();
});

function getTime(v) {
    var p = v.split(':');
    return ((p[0]-0) * 60) + (p[1]-0);
}

$triptime.on('change', function () {
    var v = $(this).val(),
        ij = 0;
    startTime = getTime(v);
    $('#settime').text($(this).val());
    tccnt.find('.trip').each(function () {
        setTripData(startTime, $(this), ij++, getArrTrip());
    });
});

$returntime.on('change', function () {
    var v = $(this).val(),
        ij = 0;
    returnTime = getTime(v);
    $('#setreturntime').text($(this).val());
    returncnt.find('.trip').each(function () {
        setTripData(returnTime, $(this), ij++, getArrReturn());
    });
});
/*
$('#whentime, #mwhentime').on('changeTime', function () {
    var sm = $(this).timepicker('getSecondsFromMidnight'),
        ij = 0;
    startTime = sm / 60;


    var arr = $('#deptype .active').index() == 1;
    tccnt.find('.trip').each(function () {
        setTripData(startTime, $(this), ij++, arr);
    });
});
*/
//$('.mtime span').on('click',function () {
//    $('#mwhentime').timePicker({
//        step: 30
//    });
//    $('#mwhentime').trigger('click');
//    $('#mwhentime').on('changeTime', function () {
//        $('.mtime span').text($(this).val());
//        console.log($(this).val());
//    });
//});

$tripday.weeksel({
    day: date,
    onchange: function (nd) {
        date = nd;
        setDate($('.mobiledate'), date);
        $when.val(date.format('yyyy-mm-dd')).change();
        //$('#when').val('setDate', date);
        //findtrip(true, false);
    }
});
$returnday.weeksel({
    day: returndate,
    onchange: function (nd) {
        returndate = nd;
        setDate($('.showdate'), returndate);
        //$('#whento').datepicker('setDate', returndate);
        $return.val(returndate.format('yyyy-mm-dd')).change();
        //findtrip(false, true);
    }
});


if ($when.hasClass('notnative')) {
    $when.datepicker({
        gotoCurrent: true,
        minDate: 0,
        maxDate: '+6M'
        /*onSelect: function(e, ui) {

            date = $(this).datepicker("getDate");
            setDate($('.mobiledate'), date);
            $tripday.trigger('changeday', [date]);
            findtrip(true, false);
        }*/
    });
}

var issafari = navigator.userAgent.toLowerCase().indexOf('safari/') > -1;

function getDate(v) {
    
    var p = v.split('-');
    return new Date(p[0], p[1]-1, p[2]);
    
    
}

$when.change(function () {
    
    
    date = getDate($(this).val());
    
    setDate($('.mobiledate'), date);
    $tripday.trigger('changeday', [date]);

    if (returndate < date) {
        $return.val(date.format('yyyy-mm-dd')).change();
    }total
    findtrip(true, false);
});

if ($('#comstartdate').hasClass('notnative')) {
    $('#comstartdate').datepicker({
        gotoCurrent: true,
        minDate: 0,
        maxDate: '+6M'
    });
}
$('#comstartdate').val(new Date().format('yyyy-mm-dd')).change(function() {
    commuterdate = new Date($(this).val());
});

if ($return.hasClass('notnative')) {
    $return.datepicker({
        gotoCurrent: true,
        minDate: 0,
        maxDate: '+6M'
    });
}
$return.change(function () {
    
    
    returndate = date = getDate($(this).val());
    
    setDate($('.returnwrap'), returndate);
    $returnday.trigger('changeday', [returndate]);
    if (returndate < date) {
        $when.val(returndate.format('yyyy-mm-dd')).change();
    }
    findtrip(false, true);
});

function setDate(parent, date) {
    parent.find('.mmonthname').text(monthNames[date.getMonth()]);
    parent.find('.mdayname').text(dayNames[date.getDay()]);
    parent.find('.mdate').text(date.getDate());
    parent.find('.myear').text(1900 + date.getYear());
}

$when.click(function (e) { e.stopPropagation(); });
$return.click(function (e) { e.stopPropagation(); });

$('.dateclick').bind('click touchstart',function (e) {
    console.log("click");
    e.stopPropagation(); e.preventDefault();
    if (e.target || e.srcElement) {
        $when.focus().click();
    }
    //$when.datepicker('show');
});

setDate($('.showdate'), returndate);
setDate($('.mobiledate'), date);


$('.clickreturndate').bind('click touchstart', function (e) {
    //console.log(e);
    e.stopPropagation(); e.preventDefault();
    if (e.target || e.srcElement) {
        $return.focus().click(function () {
            e.stopPropagation();
            return false;
        });
    }
    //$return.datepicker('show');
});
/*
$('#whento').datepicker({
    gotoCurrent: true,
    onSelect: function (e, ui) {
        //console.log('date',ui);
        returndate = $(this).datepicker("getDate");
        $returnday.trigger('changeday', [date]);
        findtrip(false, true);
    }
});
*/
$('.switchtype span').click(function () {
    $(this).parent().children('span').removeClass('active');
    $(this).addClass('active');
});

var usegmap = $(window).width() > 768;

if (usegmap) {
    var styles = [
      {
          "featureType": "road.local",
          "stylers": [
            { "visibility": "off" }
          ]
      }, {
          "featureType": "road.arterial",
          "stylers": [
            { "visibility": "off" }
          ]
      }, {
          "featureType": "landscape.natural.terrain",
          "stylers": [
            { "visibility": "off" }
          ]
      }, {
          "featureType": "water",
          "stylers": [
            { "visibility": "simplified" },
            { "color": "#d2d9dd" }
          ]
      }, {
          "featureType": "landscape.natural",
          "elementType": "geometry.fill",
          "stylers": [
            { "visibility": "on" },
            { "color": "#fafafa" }
          ]
      }, {
          "featureType": "poi.park",
          "stylers": [
            { "visibility": "off" }
          ]
      }, {
          "featureType": "poi.attraction",
          "stylers": [
            { "visibility": "off" }
          ]
      }, {
          "featureType": "poi.business",
          "stylers": [
            { "visibility": "off" }
          ]
      }, {
          "featureType": "poi.place_of_worship",
          "stylers": [
            { "visibility": "off" }
          ]
      }, {
          "featureType": "transit.station",
          "stylers": [
            { "visibility": "on" }
          ]
      }, {
          "featureType": "transit.line",
          "stylers": [
            { "visibility": "on" }
          ]
      }, {
          "featureType": "road.highway",
          "stylers": [
            { "visibility": "on" },
            { "hue": "#94b1b1" },
            { "saturation": "-50" },
            { "weight": 0.5 }
          ]
      }
    ];


    function showmap() {
        //directionsService = new google.maps.DirectionsService();
        //directionsDisplay = new google.maps.DirectionsRenderer();
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            styles: styles,
            center: new google.maps.LatLng(60, 16),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        //map.setOptions({ styles: styles });
    }

    window.gmapp = showmap;
    if (window.google && window.google.maps)
        showmap();
    else
        ql.load('http://maps.google.com/maps/api/js?sensor=true&callback=gmapp', showmap);
}

if (lastdata) {
    setTimeout(function () {
        findtrip(true, true);
    }, 500);

}

$('#otherdate').click(function () {
    $('#daybefore').hide();
    $('#dayafter').show();
});

setTimeout(function () {

    $('.searchwrapper .hideload').addClass('showload');
}, 400);
fd('bookingbase.js');