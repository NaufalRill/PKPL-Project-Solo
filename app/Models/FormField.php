<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FormField extends Model
{
    use HasUlids;

    const TYPE_SHORT_TEXT = 0;

    const TYPE_LONG_TEXT = 1;

    const TYPE_MULTIPLE_CHOICE = 2;

    const TYPE_CHECKBOX = 3;

    const TYPE_DROPDOWN = 4;

    const TYPE_NUMBER = 5;

    const TYPE_EMAIL = 6;

    const TYPE_PHONE = 7;

    const TYPE_DATE = 8;

    const TYPE_TIME = 9;

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class, 'form_id', 'id');
    }

    public function submissions(): BelongsToMany
    {
        return $this->belongsToMany(FormSubmission::class, 'form_fields_submissions', 'field_id', 'submission_id')->using(FormSubmissionField::class);
    }
}
