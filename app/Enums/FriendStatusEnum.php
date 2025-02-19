<?php

namespace App\Enums;

enum FriendStatusEnum: string
{
    case Pending = "pending";
    case Accept = "accept";
    case Block = "block";
    case Reject = "reject";
}