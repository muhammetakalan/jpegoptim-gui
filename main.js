#!/usr/bin/gjs

imports.gi.versions.Gtk = "3.0";
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

class main {
  constructor() {
    this.application = new Gtk.Application();
    this.application.connect("activate", this.onActivate.bind(this));
    this.application.connect("startup", this.onStartup.bind(this));
  }

  onActivate() {
    this.window.show_all();
  }

  onStartup() {
    let builder = new Gtk.Builder();
    builder.add_from_file("ui.glade");

    this.window = builder.get_object("window");
    this.fileChooser = builder.get_object("fileChooser");
    this.adjustment = builder.get_object("adjustment");
    this.labelStatus = builder.get_object("labelStatus");
    this.labelInfo = builder.get_object("labelInfo");
    this.optimizeBtn = builder.get_object("optimizeBtn");

    this.fileChooser.connect("selection-changed", this.changed.bind(this));
    this.adjustment.connect("value-changed", this.changed.bind(this));
    this.optimizeBtn.connect("clicked", this.optimize.bind(this));

    this.application.add_window(this.window);
  }

  changed() {
    if (this.adjustment.get_value() && this.fileChooser.get_filename()) {
      this.optimizeBtn.set_sensitive(true);
    } else {
      this.optimizeBtn.set_sensitive(false);
    }
    if (this.adjustment.get_value() > 50) {
      this.labelStatus.set_markup(
        "<span foreground='red'>High optimizing rates are not recommended !</span>"
      );
    } else {
      this.labelStatus.set_text("Lossless image optimization app");
    }
  }

  optimize() {
    try {
      let proc = Gio.Subprocess.new(
        [
          "jpegoptim",
          "-m",
          (100 - this.adjustment.get_value()).toString(),
          this.fileChooser.get_filename(),
        ],
        Gio.SubprocessFlags.NONE
      );
      proc.wait_async(new Gio.Cancellable(), (proc, result) => {
        if (proc.get_successful()) {
          this.optimizeBtn.set_sensitive(false);
          this.labelStatus.set_markup(
            "<span foreground='yellow'>Optimized !</span>"
          );
        } else {
          this.labelStatus.set_markup(
            "<span foreground='red'>Optimization error !</span>"
          );
        }
      });
    } catch (e) {
      this.labelStatus.set_markup(
        "<span foreground='red'>jpegoptim is not installed !</span>"
      );
    }
  }
}

new main().application.run(ARGV);
