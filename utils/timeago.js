/**
 * https://github.com/hustcc/timeago.js
 **/
/* jshint expr: true */
! function(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(root); // nodejs support
        module.exports['default'] = module.exports; // es6 support
    } else
        root.timeago = factory(root);
}(typeof window !== 'undefined' ? window : this,
    function() {
        var indexMapEn = 'second_minute_hour_day_week_month_year'.split('_'),
            indexMapZh = '秒_分钟_小时_天_周_月_年'.split('_'),
            // build-in locales: en & zh_CN
            locales = {
                'en': function(number, index) {
                    if (index === 0) return ['just now', 'right now'];
                    var unit = indexMapEn[parseInt(index / 2)];
                    if (number > 1) unit += 's';
                    return [number + ' ' + unit + ' ago', 'in ' + number + ' ' + unit];
                },
                'zh_CN': function(number, index) {
                    if (index === 0) return ['刚刚', '片刻后'];
                    var unit = indexMapZh[parseInt(index / 2)];
                    return [number + unit + '前', number + unit + '后'];
                }
            },
            // second, minute, hour, day, week, month, year(365 days)
            SEC_ARRAY = [60, 60, 24, 7, 365 / 7 / 12, 12],
            SEC_ARRAY_LEN = 6,
            // ATTR_DATETIME = 'datetime',
            ATTR_DATA_TID = 'data-tid',
            timers = {}; // real-time render timers

        // format Date / string / timestamp to Date instance.
        function toDate(input) {
            if (input instanceof Date) return input;
            if (!isNaN(input)) return new Date(toInt(input));
            if (/^\d+$/.test(input)) return new Date(toInt(input));
            input = (input || '').trim().replace(/\.\d+/, '') // remove milliseconds
                .replace(/-/, '/').replace(/-/, '/')
                .replace(/(\d)T(\d)/, '$1 $2').replace(/Z/, ' UTC') // 2017-2-5T3:57:52Z -> 2017-2-5 3:57:52UTC
                .replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
            return new Date(input);
        }
        // change f into int, remove decimal. Just for code compression
        function toInt(f) {
            return parseInt(f);
        }
        // format the diff second to *** time ago, with setting locale
        function formatDiff(diff, locale, defaultLocale) {
            locale = locales[locale] ? locale : (locales[defaultLocale] ? defaultLocale : 'zh_CN');
            // if (! locales[locale]) locale = defaultLocale;
            var i = 0,
                agoin = diff < 0 ? 1 : 0, // timein or timeago
                total_sec = diff = Math.abs(diff);

            for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
                diff /= SEC_ARRAY[i];
            }
            diff = toInt(diff);
            i *= 2;

            if (diff > (i === 0 ? 9 : 1)) i += 1;
            return locales[locale](diff, i, total_sec)[agoin].replace('%s', diff);
        }
        // calculate the diff second between date to be formated an now date.
        function diffSec(date, nowDate) {
            nowDate = nowDate ? toDate(nowDate) : new Date();
            return (nowDate - toDate(date)) / 1000;
        }
        
        function nextInterval(diff) {
            var rst = 1,
                i = 0,
                d = Math.abs(diff);
            for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
                diff /= SEC_ARRAY[i];
                rst *= SEC_ARRAY[i];
            }
            // return leftSec(d, rst);
            d = d % rst;
            d = d ? rst - d : rst;
            return Math.ceil(d);
        }
        // get the datetime attribute, `data-timeagp` / `datetime` are supported.
        function getDateAttr(node) {
            return getAttr(node, 'data-timeago') || getAttr(node, 'datetime');
        }
        // get the node attribute, native DOM and jquery supported.
        function getAttr(node, name) {
            if (node.getAttribute) return node.getAttribute(name); // native
            if (node.attr) return node.attr(name); // jquery
        }
        // set the node attribute, native DOM and jquery supported.
        function setTidAttr(node, val) {
            if (node.setAttribute) return node.setAttribute(ATTR_DATA_TID, val); // native
            if (node.attr) return node.attr(ATTR_DATA_TID, val); // jquery
        }
        
        function Timeago(nowDate, defaultLocale) {
            this.nowDate = nowDate;
            // if do not set the defaultLocale, set it with `en`
            this.defaultLocale = defaultLocale || 'zh_CN'; // use default build-in locale
            // for dev test
            // this.nextInterval = nextInterval;
        }

        
        Timeago.prototype.format = function(date, locale) {
            return formatDiff(diffSec(date, this.nowDate), locale, this.defaultLocale);
        };
        
        Timeago.prototype.render = function(nodes, locale) {
            if (nodes.length === undefined) nodes = [nodes];
            for (var i = 0, len = nodes.length; i < len; i++) {
                this.doRender(nodes[i], getDateAttr(nodes[i]), locale); // render item
            }
        };
        
        Timeago.prototype.setLocale = function(locale) {
            this.defaultLocale = locale;
        };
        
        function timeagoFactory(nowDate, defaultLocale) {
            return new Timeago(nowDate, defaultLocale);
        }
        
        timeagoFactory.register = function(locale, localeFunc) {
            locales[locale] = localeFunc;
        };

        timeagoFactory.cancel = function(node) {
            var tid;
            // assigning in if statement to save space
            if (node) {
                tid = getAttr(node, ATTR_DATA_TID); // get the timer of DOM node(native / jq).
                if (tid) {
                    clearTimeout(tid);
                    delete timers[tid];
                }
            } else {
                for (tid in timers) clearTimeout(tid);
                timers = {};
            }
        };

        return timeagoFactory;
    });
