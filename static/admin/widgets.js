/*global CMS,h,createClass*/

class JSONMap extends Map {
  toJSON() {
    let o = {};
    for (let [k, v] of this.entries()) {
      o[k] = v;
    }
    return o;
  }
}

let SupportersControl = createClass({
  handleTextArea(e) {
    this.setState({ textarea: e.target.value });
  },
  handleAdd() {
    let values = [];
    let newEntries = this.state?.textarea || "";
    newEntries = newEntries.split("\n");
    let n = 0;
    for (let line of newEntries) {
      line = line.trim();
      let tsv = line.split("\t");
      if (tsv.length === 1) {
        tsv = line.split(" ");
      }
      if (tsv.filter((s) => !!s).length < 1) {
        continue;
      }
      let display = tsv.filter((s) => !!s).join(" ");
      let sort = display;
      if (tsv.length > 1) {
        let head = tsv.slice(0, -1);
        let tail = tsv[tsv.length - 1];
        sort = [tail + ",", ...head].filter((s) => !!s).join(" ");
      }
      values.push(
        new JSONMap([
          ["display", display],
          ["sort", sort],
        ]),
      );
      n++;
    }
    values = values.concat(Array.from(this.props.value));
    this.setState({ textarea: "" });
    if (n > 0) {
      window.alert(`Added ${n} new supporters. Please review and publish.`);
    } else {
      window.alert(`Nothing to add.`);
    }
    this.props.onChange(values);
  },
  handleRemove(n) {
    let values = Array.from(this.props.value);
    values.splice(n, 1);
    this.props.onChange(values);
  },
  handleChange(prop, n, ev) {
    let text = ev.target.value;
    let values = Array.from(this.props.value);
    let v = new JSONMap(values[n].entries());
    v.set(prop, text);
    values[n] = v;
    this.props.onChange(values);
  },
  newEntriesWidget() {
    return h("div", {
      children: [
        h("label", {
          className: "spl-label",
          children: "New entries",
        }),
        h("textarea", {
          rows: 10,
          placeholder:
            "Paste new supporters here. List will automatically sort by “sort as name”. Institution names like “The ACME Corp” should be sorted as “ACME Corp, The” or just “ACME Corp”.",
          value: this.state?.textarea || "",
          onChange: this.handleTextArea,
          className: this.props.classNameWidget,
        }),
        h("button", {
          disabled: !this.state?.textarea,
          onClick: this.handleAdd,
          children: "Add entries",
        }),
      ],
    });
  },

  supportersRow(supporterObj, n) {
    return h("div", {
      className: "spl-col",
      children: [
        h("div", {
          children: [
            h("label", {
              className: "spl-label",
              children: "Sort as name",
            }),
            h("input", {
              className: this.props.classNameWidget,
              value: supporterObj.get("sort"),
              onInput: (ev) => this.handleChange("sort", n, ev),
            }),
          ],
        }),
        h("div", {
          children: [
            h("label", {
              className: "spl-label",
              children: "Display name",
            }),
            h("input", {
              className: this.props.classNameWidget,
              value: supporterObj.get("display"),
              onInput: (ev) => this.handleChange("display", n, ev),
            }),
          ],
        }),
        h("div", {
          className: "spl-center",
          children: h("button", {
            onClick: () => this.handleRemove(n),
            children: "Remove",
          }),
        }),
      ],
    });
  },

  render() {
    return h("div", {
      id: this.props.forID,
      className: this.props.classNameWrapper,
      children: [
        this.newEntriesWidget(),
        h("label", {
          className: "spl-label",
          children: "Current entries",
        }),
        h("div", {
          className: this.props.classNameWrapper,
          children: [
            h("div", {
              className: "spl-row",
              children: [this.props.value.map(this.supportersRow)],
            }),
          ],
        }),
      ],
    });
  },
});

CMS.registerWidget("supporters", SupportersControl);
