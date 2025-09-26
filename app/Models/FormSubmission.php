<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FormSubmission extends Model
{
    use HasUlids;

    public function fields(): BelongsToMany
    {
        return $this->belongsToMany(FormField::class, 'form_fields_submissions', 'submission_id', 'field_id')->using(FormSubmissionField::class);
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class, 'form_id', 'id');
    }
}
