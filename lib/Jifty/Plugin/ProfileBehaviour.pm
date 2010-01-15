use strict;
use warnings;

package Jifty::Plugin::ProfileBehaviour;
use base qw/Jifty::Plugin/;

our $VERSION = '0.02';

=head1 NAME

Jifty::Plugin::ProfileBehaviour - Overrides behaviour.js to add profiling information

=head1 DESCRIPTION

This plugin overrides the stock behaviour.js library to add timing and
profiling information.  Add it if your web pages are slow to style,
and you want to track down which rules are causing the slowness.

=head1 METHODS

=head2 init

Adds the CSS file needed for on-screen profiling.

=cut

sub init {
    Jifty->web->add_css('behaviour-profile.css');
}

1;
