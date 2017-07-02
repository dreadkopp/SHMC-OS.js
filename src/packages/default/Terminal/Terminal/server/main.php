<?php

namespace OSjs\Packages;

use OSjs\Core\Request;

class Terminal
{

    public static function test(Request $request, Array $args = Array())
    {
        return 'This is a response from your application';
    }

}

return 'OSjs\\Packages\\Terminal';
