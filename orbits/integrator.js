/*
    Copyright (C) 2013-2021  Ian Smith <m4r35n357@gmail.com>

    The JavaScript code in this page is free software: you can
    redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The code is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    that code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.
*/

/*jslint white: true, browser: true, safe: true */

"use strict";

var SYMPLECTIC = {
    initialize: function (order) {
        this.wFwd = 1.0 / (4.0 - 4.0**(1.0 / 9.0))
        this.xFwd = 1.0 / (4.0 - 4.0**(1.0 / 7.0))
        this.yFwd = 1.0 / (4.0 - 4.0**(1.0 / 5.0))
        this.zFwd = 1.0 / (4.0 - 4.0**(1.0 / 3.0))
        this.wBack = 1.0 - 4.0 * this.wFwd
        this.xBack = 1.0 - 4.0 * this.xFwd
        this.yBack = 1.0 - 4.0 * this.yFwd
        this.zBack = 1.0 - 4.0 * this.zFwd
        switch(order) {
            case 2:
                this.method = this.secondOrder;
            break;
            case 4:
                this.method = this.fourthOrder;
            break;
            case 6:
                this.method = this.sixthOrder;
            break;
            case 8:
                this.method = this.eightthOrder;
            break;
            case 10:
                this.method = this.tenthOrder;
            break;
        }
    },
    suzuki: function (self, model, base, cd, forward, back) {
        base(self, model, cd * forward);
        base(self, model, cd * forward);
        base(self, model, cd * back);
        base(self, model, cd * forward);
        base(self, model, cd * forward);
    },
    base2: function (self, model, cd) { // 2nd-order symplectic building block
        model.updateQ(cd * 0.5);
        model.updateP(cd);
        model.updateQ(cd * 0.5);
    },
    secondOrder: function (model, h) {
        this.base2(this, model, h);
    },
    base4: function (self, model, cd) {
        self.suzuki(self, model, self.base2, cd, self.zFwd, self.zBack);
    },
    fourthOrder: function (model, h) {
        this.base4(this, model, h);
    },
    base6: function (self, model, cd) {
        self.suzuki(self, model, self.base4, cd, self.yFwd, self.yBack);
    },
    sixthOrder: function (model, h) {
        this.base6(this, model, h);
    },
    base8: function (self, model, cd) {
        self.suzuki(self, model, self.base6, cd, self.xFwd, self.xBack);
    },
    eightthOrder: function (model, h) {
        this.base8(this, model, h);
    },
    base10: function (self, model, cd) {
        self.suzuki(self, model, self.base8, cd, self.wFwd, self.wBack);
    },
    tenthOrder: function (model, h) {
        this.base10(this, model, h);
    },
};
